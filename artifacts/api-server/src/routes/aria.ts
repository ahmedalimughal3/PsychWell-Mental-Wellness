import { Router, type IRouter, type Request, type Response } from "express";

type AriaLanguage = "en" | "ur";
type ChatRole = "user" | "assistant";
type ChatTurn = { role: ChatRole; content: string };
type ChatRequest = { message?: unknown; language?: unknown; history?: unknown };

const router: IRouter = Router();
const crisisPattern =
  /suicid|kill myself|end my life|hurt myself|self[- ]?harm|want to die|better off dead|can't stay safe|cannot stay safe|مر جانا|خودکشی|خود کو نقصان|اپنے آپ کو نقصان|زندگی ختم|محفوظ نہیں/i;

const safetyReply = (language: AriaLanguage) =>
  language === "ur"
    ? "اگر آپ خود کو یا کسی اور کو نقصان پہنچا سکتے ہیں، یا محفوظ نہیں رہ سکتے، تو ابھی مقامی ہنگامی خدمات کو کال کریں اور کسی قابلِ اعتماد شخص کے قریب جائیں۔ پاکستان میں ہسپتال کے ایمرجنسی ڈیپارٹمنٹ جائیں یا مقامی ذہنی صحت کی سروس سے رابطہ کریں۔ ڈاکٹر آریا بحران میں مدد نہیں دے سکتی۔"
    : "If you might hurt yourself or someone else, or cannot stay safe, call local emergency services now and move near a trusted person. In Pakistan, go to a hospital emergency department or contact a local mental-health service. Dr. Aria cannot provide crisis care.";

const isChatTurn = (value: unknown): value is ChatTurn => {
  if (!value || typeof value !== "object") return false;
  const turn = value as Record<string, unknown>;
  return (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string" &&
    turn.content.trim().length > 0 &&
    turn.content.length <= 1200;
};

const getRequest = (req: Request) => {
  const body = req.body as ChatRequest;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const language: AriaLanguage = body.language === "ur" ? "ur" : "en";
  const history = Array.isArray(body.history) ? body.history.filter(isChatTurn).slice(-12) : [];
  return { message, language, history };
};

router.post("/aria/chat", async (req: Request, res: Response) => {
  const { message, language, history } = getRequest(req);
  if (!message || message.length > 1200) {
    res.status(400).json({ error: "Message must be between 1 and 1200 characters." });
    return;
  }

  if (crisisPattern.test(message)) {
    res.json({ reply: safetyReply(language), safety: true });
    return;
  }

  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!baseUrl || !apiKey) {
    res.status(503).json({ error: "The real AI service is not configured." });
    return;
  }

  const systemPrompt = language === "ur"
    ? "آپ ڈاکٹر آریا ہیں، ایک نرم، غیر فیصلہ کن CBT پر مبنی غور و فکر کی ساتھی۔ اردو میں جواب دیں۔ تشخیص، دوا یا ہنگامی دیکھ بھال کا دعویٰ نہ کریں۔ صارف کے احساس کو تسلیم کریں، ایک مختصر عکاسی یا کھلا سوال دیں، اور جہاں مناسب ہو ایک چھوٹا قابلِ عمل قدم تجویز کریں۔ زبردستی مثبت بات، لمبی فہرست، یا ایسا لہجہ نہ اپنائیں جو لائسنس یافتہ تھراپسٹ ہونے کا تاثر دے۔"
    : "You are Dr. Aria, a warm, non-judgmental CBT-grounded reflection companion. Reply in English. Do not diagnose, prescribe, or claim to provide emergency care. Acknowledge the person's experience, offer a brief reflection or open question, and when useful suggest one small doable next step. Avoid forced positivity, long lists, or language that implies you are a licensed therapist.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(({ role, content }) => ({ role, content })),
    { role: "user", content: message },
  ];

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6-terra",
        max_completion_tokens: 500,
        messages,
      }),
    });
    const payload = await upstream.json().catch(() => null) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    } | null;
    const reply = payload?.choices?.[0]?.message?.content?.trim();
    if (!upstream.ok || !reply) {
      res.status(502).json({ error: "The AI service returned no reply." });
      return;
    }
    res.json({ reply });
  } catch {
    res.status(502).json({ error: "The AI service could not be reached." });
  }
});

export default router;