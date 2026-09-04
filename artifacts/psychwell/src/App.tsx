import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Brain, Check, ChevronDown, CircleHelp,
  Clock3, Compass, Heart, Home as HomeIcon, Info, Leaf, LockKeyhole, Menu, MessageCircle,
  PenLine, Phone as PhoneIcon, Play, RotateCcw, Search, Send, Settings as SettingsIcon,
  ShieldCheck, Sparkles, Star, Trash2, Wind, X, Zap,
} from 'lucide-react';

type Lang = 'en' | 'ur';
type Mood = 'low' | 'uneasy' | 'steady' | 'good' | 'bright';
type Role = 'user' | 'assistant';
type Profile = { language: Lang; onboarded: boolean };
type JournalEntry = { id: string; createdAt: string; mood: Mood; text: string; reflection: string };
type MoodLog = { id: string; createdAt: string; mood: Mood };
type ChatMessage = { id: string; role: Role; content: string; createdAt: string };
type AssessmentResult = { id: string; assessmentId: string; score: number; band: string; createdAt: string; answers: number[] };
type Settings = { language: Lang; onboarded: boolean };

const KEY = {
  settings: 'psychwell_settings', profile: 'psychwell_profile', journals: 'psychwell_journals',
  moods: 'psychwell_moods', chats: 'psychwell_chats', results: 'psychwell_assessment_results',
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const getStored = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};
const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));
const now = () => new Date().toISOString();

const copy = {
  en: {
    appName: 'PsychWell', mark: 'a private pause for your mind',
    nav: { home: 'Today', journal: 'Journal', aria: 'Dr. Aria', assessments: 'Self-checks', exercises: 'Exercises', specialists: 'Find support', settings: 'Settings' },
    welcomeTitle: 'A quieter place to meet yourself.', welcomeBody: 'PsychWell is a private, browser-only space for small check-ins, honest pages, and steadier days. Nothing leaves this device.', begin: 'Begin gently', chooseLanguage: 'Choose your language', english: 'English', urdu: 'اردو', welcomeFoot: 'No account. No cloud. No judgement.',
    goodMorning: 'Good to see you.', morningNote: 'A small check-in can change the shape of a day.', checkin: 'How are you arriving today?', checkinHint: 'There is no right answer. Choose what feels closest.', saved: 'Saved on this device', savedShort: 'Saved locally', privacyTitle: 'Your thoughts stay yours.', privacyBody: 'PsychWell keeps your journal, moods, and conversations in this browser. Dr. Aria replies are generated on this device.', learnMore: 'See privacy settings',
    recent: 'Your recent rhythm', noMoods: 'Your rhythm will appear here', noMoodsBody: 'A few daily check-ins make patterns easier to notice — without turning you into a number.', suggested: 'A gentle suggestion', basedOn: 'Based on your latest check-in', openExercise: 'Try this exercise', latest: 'Latest',
    journalTitle: 'A page for what is here.', journalBody: 'Write without editing yourself. This space is only for you.', newEntry: 'New entry', mood: 'Mood', entryText: 'What is on your mind?', entryPlaceholder: 'Let the page hold the unfinished thought…', reflection: 'A little reflection (optional)', reflectionPlaceholder: 'What might you need next?', saveEntry: 'Save entry', cancel: 'Cancel', history: 'Your pages', emptyJournal: 'Your first page is waiting.', emptyJournalBody: 'There is no perfect way to begin. Start with one honest sentence.', trend: 'Mood over time', entries: 'entries', entrySaved: 'Entry saved', delete: 'Delete', confirmDelete: 'Remove this page from this device?', today: 'Today',
    ariaTitle: 'A thoughtful conversation.', ariaBody: 'Dr. Aria can help you slow down, name what is happening, and find a next small step — privately on this device.', ariaDisclaimer: 'Dr. Aria is a supportive reflection tool, not a licensed therapist or a crisis substitute. If you may be in immediate danger, contact local emergency services or a trusted person nearby. In Pakistan, you can also seek a hospital emergency department or a local mental-health service.', chatEmpty: 'You can start with whatever feels easiest.', chatEmptyBody: 'Try “I have been feeling stretched thin” or simply say hello.', inputPlaceholder: 'Write what is on your mind…', send: 'Send', ariaFallback: 'Thank you for trusting this space with that. I’m here to help you slow it down. What part feels heaviest right now — your thoughts, your body, or what is happening around you?', ariaFallback2: 'That sounds like a lot to carry alone. Could we look for one small, kind thing that might make the next ten minutes easier?', clearChat: 'Clear conversation', chatCleared: 'Conversation cleared', ariaOfflineMode: 'Offline reflection', ariaOfflineDetail: 'Private-first. Replies are generated on this device and your messages stay here.', ariaOfflineActive: 'Offline mode is on. Messages stay on this device and no network request is made.', ariaSafetyTitle: 'You may need immediate human support.', ariaSafetyBody: 'If you might hurt yourself or someone else, or cannot stay safe, call local emergency services now and move near a trusted person. In Pakistan, go to a hospital emergency department or contact a local mental-health service. Dr. Aria cannot provide crisis care.', ariaSafetyAck: 'Safety guidance shown',
    assessmentsTitle: 'Self-checks for noticing.', assessmentsBody: 'Short, established questionnaires can help you put words to patterns. They are self-screening tools, never a diagnosis.', take: 'Take self-check', questions: 'questions', lastTaken: 'Last taken', noResults: 'No self-checks yet', noResultsBody: 'Choose a questionnaire when you are ready. Your results remain on this device.', result: 'Result', selfScreening: 'Self-screening only — not a diagnosis.', back: 'Back', next: 'Next', seeResult: 'See my result', questionOf: 'Question {n} of {total}', score: 'Score', retake: 'Take again', resultSaved: 'Result saved locally', notClinical: 'This result is a starting point for reflection, not a clinical conclusion. Consider speaking with a qualified professional if concerns persist.',
    exercisesTitle: 'Small practices, real moments.', exercisesBody: 'Evidence-informed ways to settle, shift perspective, or reconnect with what matters.', minutes: 'min', steps: 'steps', start: 'Start practice', step: 'Step', finish: 'Finish practice', done: 'Practice complete', breatheIn: 'Breathe in', hold: 'Hold', breatheOut: 'Breathe out', pause: 'Pause', reset: 'Reset timer',
    specialistsTitle: 'Finding support in Karachi.', specialistsBody: 'A practical starting point for finding local and tele-mental health support.', searchPlaceholder: 'Search by name, area, or support type', allAreas: 'All areas', directoryNote: 'These options are collected from public organization websites. Please verify credentials, availability, fees, and contact details directly before sharing personal information.', noSpecialists: 'No support options match', noSpecialistsBody: 'Try a different area or search term. For immediate danger, go to the nearest hospital emergency department.', verify: 'Verify details before contacting', officialSource: 'Official source', viewWebsite: 'Open website', callSupport: 'Call', hours: 'Hours', address: 'Location', results: 'support options', areaDha: 'DHA', areaKorangi: 'Korangi', areaKeamari: 'Keamari', areaNazimabad: 'Nazimabad', areaNorthNazimabad: 'North Nazimabad', placeholderTag: 'Public source · verify current details',
    settingsTitle: 'A space that stays with you.', language: 'Language', languageBody: 'Choose how PsychWell speaks with you.', privacy: 'Privacy, in plain language', clearData: 'Clear all PsychWell data', clearDataHint: 'This cannot be undone.', clearConfirm: 'Clear all local data? Your pages, moods, conversations, and results will be removed from this browser.', cleared: 'Local data cleared', about: 'About PsychWell', aboutBody: 'A quiet personal space for people in Pakistan to think, check in, and care for themselves — in English or Urdu.', version: 'Browser-only edition · 1.0', close: 'Close',
    errorTitle: 'The page took a quiet pause.', errorBody: 'Try returning to Today.', goHome: 'Return to Today',
  },
  ur: {
    appName: 'سائیک ویل', mark: 'آپ کے ذہن کے لیے ایک نجی وقفہ',
    nav: { home: 'آج', journal: 'جرنل', aria: 'ڈاکٹر آریا', assessments: 'خود جانچ', exercises: 'مشقیں', specialists: 'مدد تلاش کریں', settings: 'ترتیبات' },
    welcomeTitle: 'اپنے آپ سے ملنے کی ایک پُرسکون جگہ۔', welcomeBody: 'سائیک ویل چھوٹے چیک اِن، سچے صفحات اور بہتر دنوں کے لیے ایک نجی، براؤزر تک محدود جگہ ہے۔ کچھ بھی اس ڈیوائس سے باہر نہیں جاتا۔', begin: 'نرمی سے شروع کریں', chooseLanguage: 'اپنی زبان منتخب کریں', english: 'English', urdu: 'اردو', welcomeFoot: 'کوئی اکاؤنٹ نہیں۔ کوئی کلاؤڈ نہیں۔ کوئی فیصلہ نہیں۔',
    goodMorning: 'آپ کو دیکھ کر خوشی ہوئی۔', morningNote: 'ایک چھوٹا سا چیک اِن دن کا رخ بدل سکتا ہے۔', checkin: 'آپ آج کیسا محسوس کر رہے ہیں؟', checkinHint: 'کوئی درست جواب نہیں۔ جو قریب لگے اسے چنیں۔', saved: 'اس ڈیوائس پر محفوظ', savedShort: 'مقامی طور پر محفوظ', privacyTitle: 'آپ کے خیالات آپ کے ہیں۔', privacyBody: 'سائیک ویل آپ کا جرنل، موڈ اور گفتگو اسی براؤزر میں محفوظ کرتا ہے۔ ڈاکٹر آریا کے جوابات اسی ڈیوائس پر بنتے ہیں۔', learnMore: 'پرائیویسی ترتیبات دیکھیں',
    recent: 'آپ کی حالیہ کیفیت', noMoods: 'آپ کی کیفیت یہاں ظاہر ہوگی', noMoodsBody: 'روزانہ چند چیک اِن پیٹرن سمجھنے میں مدد دیتے ہیں — آپ کو کسی نمبر میں بدلے بغیر۔', suggested: 'ایک نرم مشورہ', basedOn: 'آپ کے تازہ چیک اِن کی بنیاد پر', openExercise: 'یہ مشق آزمائیں', latest: 'تازہ ترین',
    journalTitle: 'جو کچھ یہاں ہے، اس کے لیے ایک صفحہ۔', journalBody: 'بغیر ترمیم کے لکھیں۔ یہ جگہ صرف آپ کے لیے ہے۔', newEntry: 'نیا اندراج', mood: 'موڈ', entryText: 'آپ کے ذہن میں کیا ہے؟', entryPlaceholder: 'نامکمل خیال کو صفحہ سنبھالنے دیں…', reflection: 'تھوڑا سا غور (اختیاری)', reflectionPlaceholder: 'اب آپ کو کس چیز کی ضرورت ہو سکتی ہے؟', saveEntry: 'اندراج محفوظ کریں', cancel: 'منسوخ', history: 'آپ کے صفحات', emptyJournal: 'آپ کا پہلا صفحہ منتظر ہے۔', emptyJournalBody: 'شروع کرنے کا کوئی کامل طریقہ نہیں۔ ایک سچا جملہ لکھیں۔', trend: 'وقت کے ساتھ موڈ', entries: 'اندراجات', entrySaved: 'اندراج محفوظ ہوگیا', delete: 'حذف کریں', confirmDelete: 'کیا اس صفحے کو اس ڈیوائس سے ہٹانا ہے؟', today: 'آج',
    ariaTitle: 'ایک سمجھدار گفتگو۔', ariaBody: 'ڈاکٹر آریا آپ کو ٹھہرنے، ہونے والی بات کو نام دینے اور اگلا چھوٹا قدم تلاش کرنے میں مدد دے سکتی ہیں — اسی ڈیوائس پر نجی طور پر۔', ariaDisclaimer: 'ڈاکٹر آریا ایک معاون غور و فکر کا آلہ ہے، لائسنس یافتہ تھراپسٹ یا بحران کا متبادل نہیں۔ اگر آپ فوری خطرے میں ہوں تو مقامی ہنگامی خدمات یا کسی قابلِ اعتماد قریبی شخص سے رابطہ کریں۔ پاکستان میں ہسپتال کے ایمرجنسی ڈیپارٹمنٹ یا مقامی ذہنی صحت کی سروس سے بھی مدد لیں۔', chatEmpty: 'آپ جس بات سے آسانی ہو، وہیں سے شروع کریں۔', chatEmptyBody: 'مثلاً لکھیں: “میں بہت تھکا ہوا محسوس کر رہا ہوں” یا صرف سلام کہیں۔', inputPlaceholder: 'اپنے ذہن کی بات لکھیں…', send: 'بھیجیں', ariaFallback: 'اس جگہ پر بھروسا کرنے کے لیے شکریہ۔ آئیے اسے آہستہ کرتے ہیں۔ اس وقت سب سے بھاری کیا لگ رہا ہے — آپ کے خیالات، جسم، یا اردگرد کی صورتحال؟', ariaFallback2: 'یہ اکیلے اٹھانا واقعی مشکل لگتا ہے۔ کیا ہم ایک ایسی چھوٹی اور مہربان چیز ڈھونڈ سکتے ہیں جو اگلے دس منٹ آسان بنا دے؟', clearChat: 'گفتگو صاف کریں', chatCleared: 'گفتگو صاف ہوگئی', ariaOfflineMode: 'آف لائن غور', ariaOfflineDetail: 'رازداری پہلے۔ جوابات اسی ڈیوائس پر بنتے ہیں اور پیغامات یہیں رہتے ہیں۔', ariaOfflineActive: 'آف لائن طریقہ آن ہے۔ پیغامات اسی ڈیوائس پر رہتے ہیں اور کوئی نیٹ ورک درخواست نہیں ہوتی۔', ariaSafetyTitle: 'آپ کو فوری انسانی مدد کی ضرورت ہو سکتی ہے۔', ariaSafetyBody: 'اگر آپ خود کو یا کسی اور کو نقصان پہنچا سکتے ہیں، یا محفوظ نہیں رہ سکتے، تو ابھی مقامی ہنگامی خدمات کو کال کریں اور کسی قابلِ اعتماد شخص کے قریب جائیں۔ پاکستان میں ہسپتال کے ایمرجنسی ڈیپارٹمنٹ جائیں یا مقامی ذہنی صحت کی سروس سے رابطہ کریں۔ ڈاکٹر آریا بحران میں مدد نہیں دے سکتی۔', ariaSafetyAck: 'حفاظتی رہنمائی دکھائی گئی',
    assessmentsTitle: 'غور کے لیے خود جانچ۔', assessmentsBody: 'مختصر اور مستند سوالنامے آپ کو پیٹرن کے لیے الفاظ ڈھونڈنے میں مدد دے سکتے ہیں۔ یہ تشخیص نہیں ہیں۔', take: 'خود جانچ شروع کریں', questions: 'سوالات', lastTaken: 'آخری بار', noResults: 'ابھی کوئی خود جانچ نہیں', noResultsBody: 'جب تیار ہوں، ایک سوالنامہ چنیں۔ نتائج اسی ڈیوائس پر رہتے ہیں۔', result: 'نتیجہ', selfScreening: 'صرف خود جانچ — تشخیص نہیں۔', back: 'واپس', next: 'اگلا', seeResult: 'نتیجہ دیکھیں', questionOf: 'سوال {n} از {total}', score: 'اسکور', retake: 'دوبارہ کریں', resultSaved: 'نتیجہ مقامی طور پر محفوظ ہوگیا', notClinical: 'یہ نتیجہ غور و فکر کا آغاز ہے، طبی نتیجہ نہیں۔ اگر پریشانی برقرار رہے تو کسی قابلِ اعتماد ماہر سے بات کرنے پر غور کریں۔',
    exercisesTitle: 'چھوٹی مشقیں، حقیقی لمحے۔', exercisesBody: 'پرسکون ہونے، نقطۂ نظر بدلنے یا اہم چیزوں سے دوبارہ جڑنے کے لیے شواہد پر مبنی طریقے۔', minutes: 'منٹ', steps: 'مراحل', start: 'مشق شروع کریں', step: 'مرحلہ', finish: 'مشق مکمل کریں', done: 'مشق مکمل ہوگئی', breatheIn: 'سانس اندر', hold: 'روکیں', breatheOut: 'سانس باہر', pause: 'وقفہ', reset: 'ٹائمر ری سیٹ',
    specialistsTitle: 'کراچی میں مدد تلاش کرنا۔', specialistsBody: 'مقامی اور آن لائن ذہنی صحت کی مدد تلاش کرنے کے لیے عملی آغاز۔', searchPlaceholder: 'نام، علاقے یا مدد کی قسم سے تلاش کریں', allAreas: 'تمام علاقے', directoryNote: 'یہ اختیارات عوامی تنظیمی ویب سائٹس سے لیے گئے ہیں۔ ذاتی معلومات دینے سے پہلے اسناد، دستیابی، فیس اور رابطے کی تفصیل براہِ راست ضرور چیک کریں۔', noSpecialists: 'کوئی مدد کا اختیار نہیں ملا', noSpecialistsBody: 'دوسرا علاقہ یا تلاش کا لفظ آزمائیں۔ فوری خطرے کی صورت میں قریبی ہسپتال کے ایمرجنسی ڈیپارٹمنٹ جائیں۔', verify: 'رابطے سے پہلے تفصیل چیک کریں', officialSource: 'سرکاری ذریعہ', viewWebsite: 'ویب سائٹ کھولیں', callSupport: 'کال کریں', hours: 'اوقات', address: 'مقام', results: 'مدد کے اختیارات', areaDha: 'ڈی ایچ اے', areaKorangi: 'کورنگی', areaKeamari: 'کیماڑی', areaNazimabad: 'ناظم آباد', areaNorthNazimabad: 'نارتھ ناظم آباد', placeholderTag: 'عوامی ذریعہ · موجودہ تفصیل چیک کریں',
    settingsTitle: 'ایک ایسی جگہ جو آپ کے ساتھ رہے۔', language: 'زبان', languageBody: 'چنیں کہ سائیک ویل آپ سے کیسے بات کرے۔', privacy: 'پرائیویسی، آسان لفظوں میں', clearData: 'سائیک ویل کا تمام ڈیٹا صاف کریں', clearDataHint: 'یہ واپس نہیں ہو سکتا۔', clearConfirm: 'تمام مقامی ڈیٹا صاف کرنا ہے؟ آپ کے صفحات، موڈ، گفتگو اور نتائج اس براؤزر سے ہٹا دیے جائیں گے۔', cleared: 'مقامی ڈیٹا صاف ہوگیا', about: 'سائیک ویل کے بارے میں', aboutBody: 'پاکستان کے لوگوں کے لیے سوچنے، چیک اِن کرنے اور اپنا خیال رکھنے کی ایک نجی جگہ — انگریزی یا اردو میں۔', version: 'براؤزر تک محدود ایڈیشن · 1.0', close: 'بند کریں',
    errorTitle: 'صفحے نے ایک خاموش وقفہ لیا۔', errorBody: 'آج والے صفحے پر واپس جائیں۔', goHome: 'آج پر واپس جائیں',
  },
} as const;

const moods: { id: Mood; en: string; ur: string; value: number; color: string }[] = [
  { id: 'low', en: 'Low', ur: 'بوجھل', value: 1, color: '#6f8490' },
  { id: 'uneasy', en: 'Uneasy', ur: 'بے چین', value: 2, color: '#bc8b63' },
  { id: 'steady', en: 'Steady', ur: 'متوازن', value: 3, color: '#4e897e' },
  { id: 'good', en: 'Good', ur: 'اچھا', value: 4, color: '#c99155' },
  { id: 'bright', en: 'Bright', ur: 'روشن', value: 5, color: '#db7660' },
];
const moodFor = (id: Mood) => moods.find((m) => m.id === id) ?? moods[2];
const formatDate = (value: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-PK', { day: 'numeric', month: 'short' }).format(new Date(value));
const formatTime = (value: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-PK', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));

type Assessment = { id: string; name: string; urdu: string; description: string; urduDescription: string; questions: { en: string; ur: string }[]; max: number; options: number[]; score: (answers: number[]) => number; band: (score: number) => string };
const urduQuestion = (question: string) => ({
  'Feeling nervous, anxious or on edge': 'گھبراہٹ، بے چینی یا بے قراری محسوس ہونا',
  'Not being able to stop or control worrying': 'فکر کو روکنے یا قابو کرنے میں مشکل ہونا',
  'Worrying too much about different things': 'مختلف چیزوں کے بارے میں بہت زیادہ فکر کرنا',
  'Trouble relaxing': 'پرسکون ہونے میں مشکل ہونا',
  'Being so restless that it is hard to sit still': 'اتنی بے قراری کہ بیٹھنا مشکل ہو',
  'Becoming easily annoyed or irritable': 'آسانی سے جھنجھلاہٹ یا چڑچڑاپن محسوس ہونا',
  'Feeling afraid as if something awful might happen': 'ایسا خوف محسوس ہونا جیسے کوئی بری بات ہونے والی ہو',
  'Little interest or pleasure in doing things': 'کام کرنے میں کم دلچسپی یا خوشی محسوس ہونا',
  'Feeling down, depressed, or hopeless': 'اداس، افسردہ یا ناامید محسوس ہونا',
  'Trouble falling or staying asleep, or sleeping too much': 'سونے یا سوئے رہنے میں مشکل، یا بہت زیادہ سونا',
  'Feeling tired or having little energy': 'تھکا ہوا یا کم توانائی محسوس ہونا',
  'Poor appetite or overeating': 'بھوک کم لگنا یا بہت زیادہ کھانا',
  'Feeling bad about yourself': 'اپنے بارے میں برا محسوس کرنا',
  'Trouble concentrating on things': 'چیزوں پر توجہ مرکوز کرنے میں مشکل',
  'Moving or speaking slowly, or feeling restless': 'آہستہ حرکت یا گفتگو، یا بے قراری محسوس ہونا',
  'Thoughts that you would be better off dead or hurting yourself': 'یہ خیال آنا کہ مر جانا یا خود کو نقصان پہنچانا بہتر ہوگا',
  'Upset because of something unexpected': 'اچانک پیش آنے والی بات سے پریشان ہونا',
  'Unable to control important things': 'اہم چیزوں کو قابو نہ کر پانا',
  'Nervous or stressed': 'گھبراہٹ یا تناؤ محسوس کرنا',
  'Confident about handling personal problems': 'ذاتی مسائل سنبھالنے کا اعتماد ہونا',
  'Things were going your way': 'چیزوں کا آپ کی مرضی کے مطابق ہونا',
  'Could not cope with all the things you had to do': 'ضروری کاموں کو سنبھال نہ پانا',
  'Able to control irritations': 'جھنجھلاہٹ پر قابو پانا',
  'Feeling on top of things': 'صورتحال پر قابو محسوس کرنا',
  'Angered by things outside your control': 'اپنے قابو سے باہر چیزوں پر غصہ آنا',
  'Difficulties piling up too high': 'مشکلات کا بہت زیادہ جمع ہوجانا',
  'I see myself as extraverted and enthusiastic': 'میں خود کو ملنسار اور پُرجوش سمجھتا ہوں',
  'I see myself as critical and quarrelsome': 'میں خود کو تنقیدی اور جھگڑالو سمجھتا ہوں',
  'I see myself as dependable and self-disciplined': 'میں خود کو قابلِ بھروسا اور نظم و ضبط والا سمجھتا ہوں',
  'I see myself as anxious and easily upset': 'میں خود کو فکرمند اور جلد پریشان ہونے والا سمجھتا ہوں',
  'I see myself as open to new experiences': 'میں خود کو نئے تجربات کے لیے کھلا سمجھتا ہوں',
  'I see myself as reserved and quiet': 'میں خود کو محتاط اور خاموش سمجھتا ہوں',
  'I see myself as sympathetic and warm': 'میں خود کو ہمدرد اور گرمجوش سمجھتا ہوں',
  'I see myself as disorganized and careless': 'میں خود کو بے ترتیب اور لاپرواہ سمجھتا ہوں',
  'I see myself as calm and emotionally stable': 'میں خود کو پُرسکون اور جذباتی طور پر متوازن سمجھتا ہوں',
  'I see myself as conventional and uncreative': 'میں خود کو روایتی اور کم تخلیقی سمجھتا ہوں',
  'I feel that I am a person of worth': 'مجھے لگتا ہے کہ میں قدر و قیمت رکھنے والا شخص ہوں',
  'I feel I have a number of good qualities': 'مجھے لگتا ہے کہ مجھ میں کئی اچھی خوبیاں ہیں',
  'I am inclined to feel I am a failure': 'میرا رجحان خود کو ناکام سمجھنے کا ہے',
  'I am able to do things as well as most people': 'میں زیادہ تر لوگوں کی طرح کام کر سکتا ہوں',
  'I feel I do not have much to be proud of': 'مجھے لگتا ہے کہ میرے پاس فخر کرنے کو زیادہ کچھ نہیں',
  'I take a positive attitude toward myself': 'میں اپنے بارے میں مثبت رویہ رکھتا ہوں',
  'On the whole, I am satisfied with myself': 'مجموعی طور پر میں خود سے مطمئن ہوں',
  'I wish I could have more respect for myself': 'کاش میں اپنے لیے زیادہ احترام رکھ سکتا',
  'I certainly feel useless at times': 'کبھی کبھی میں خود کو بے کار محسوس کرتا ہوں',
  'At times I think I am no good at all': 'کبھی کبھی مجھے لگتا ہے کہ میں بالکل اچھا نہیں',
  'In most ways my life is close to my ideal': 'زیادہ تر طریقوں سے میری زندگی میرے تصور کے قریب ہے',
  'The conditions of my life are excellent': 'میری زندگی کے حالات بہترین ہیں',
  'I am satisfied with my life': 'میں اپنی زندگی سے مطمئن ہوں',
  'So far I have gotten the important things I want in life': 'اب تک زندگی میں وہ اہم چیزیں ملی ہیں جو میں چاہتا تھا',
  'If I could live my life over, I would change almost nothing': 'اگر دوبارہ زندگی ملے تو میں تقریباً کچھ نہیں بدلوں گا',
}[question] ?? question);
const assessmentData: Assessment[] = [
  { id: 'gad7', name: 'GAD-7', urdu: 'اضطراب کی خود جانچ', description: 'Seven questions about anxiety symptoms over the last two weeks.', urduDescription: 'گزشتہ دو ہفتوں میں بے چینی کی علامات سے متعلق سات سوالات۔', questions: ['Feeling nervous, anxious or on edge', 'Not being able to stop or control worrying', 'Worrying too much about different things', 'Trouble relaxing', 'Being so restless that it is hard to sit still', 'Becoming easily annoyed or irritable', 'Feeling afraid as if something awful might happen'].map((en) => ({ en, ur: urduQuestion(en) })), max: 21, options: [0, 1, 2, 3], score: (a) => a.reduce((x, y) => x + y, 0), band: (s) => s < 5 ? 'Minimal range' : s < 10 ? 'Mild range' : s < 15 ? 'Moderate range' : 'Severe range' },
  { id: 'phq9', name: 'PHQ-9', urdu: 'مزاج کی خود جانچ', description: 'Nine questions about mood and daily functioning over the last two weeks.', urduDescription: 'گزشتہ دو ہفتوں میں موڈ اور روزمرہ کام سے متعلق نو سوالات۔', questions: ['Little interest or pleasure in doing things', 'Feeling down, depressed, or hopeless', 'Trouble falling or staying asleep, or sleeping too much', 'Feeling tired or having little energy', 'Poor appetite or overeating', 'Feeling bad about yourself', 'Trouble concentrating on things', 'Moving or speaking slowly, or feeling restless', 'Thoughts that you would be better off dead or hurting yourself'].map((en) => ({ en, ur: urduQuestion(en) })), max: 27, options: [0, 1, 2, 3], score: (a) => a.reduce((x, y) => x + y, 0), band: (s) => s < 5 ? 'Minimal range' : s < 10 ? 'Mild range' : s < 15 ? 'Moderate range' : s < 20 ? 'Moderately severe range' : 'Severe range' },
  { id: 'pss10', name: 'PSS-10', urdu: 'تناؤ کی خود جانچ', description: 'Ten questions about how unpredictable or overwhelming life has felt recently.', urduDescription: 'حالیہ دنوں میں زندگی کے غیر متوقع یا بہت زیادہ محسوس ہونے سے متعلق دس سوالات۔', questions: ['Upset because of something unexpected', 'Unable to control important things', 'Nervous or stressed', 'Confident about handling personal problems', 'Things were going your way', 'Could not cope with all the things you had to do', 'Able to control irritations', 'Feeling on top of things', 'Angered by things outside your control', 'Difficulties piling up too high'].map((en) => ({ en, ur: urduQuestion(en) })), max: 40, options: [0, 1, 2, 3, 4], score: (a) => a.reduce((x, y, i) => x + ([3, 4, 6, 7].includes(i) ? 4 - y : y), 0), band: (s) => s < 14 ? 'Lower perceived stress' : s < 27 ? 'Moderate perceived stress' : 'Higher perceived stress' },
  { id: 'bfi10', name: 'BFI-10', urdu: 'شخصیت کی خود جانچ', description: 'Ten brief statements about broad personality tendencies.', urduDescription: 'شخصیت کے عمومی رجحانات کے بارے میں دس مختصر بیانات۔', questions: ['I see myself as extraverted and enthusiastic', 'I see myself as critical and quarrelsome', 'I see myself as dependable and self-disciplined', 'I see myself as anxious and easily upset', 'I see myself as open to new experiences', 'I see myself as reserved and quiet', 'I see myself as sympathetic and warm', 'I see myself as disorganized and careless', 'I see myself as calm and emotionally stable', 'I see myself as conventional and uncreative'].map((en) => ({ en, ur: urduQuestion(en) })), max: 50, options: [1, 2, 3, 4, 5], score: (a) => a.reduce((x, y, i) => x + ([1, 3, 5, 7, 9].includes(i) ? 6 - y : y), 0), band: (s) => s < 20 ? 'Lower endorsement' : s < 36 ? 'Mixed endorsement' : 'Higher endorsement' },
  { id: 'rses', name: 'RSES', urdu: 'خود اعتمادی کی خود جانچ', description: 'Ten statements about how you generally feel about yourself.', urduDescription: 'آپ عام طور پر اپنے بارے میں کیسا محسوس کرتے ہیں، اس سے متعلق دس بیانات۔', questions: ['I feel that I am a person of worth', 'I feel I have a number of good qualities', 'I am inclined to feel I am a failure', 'I am able to do things as well as most people', 'I feel I do not have much to be proud of', 'I take a positive attitude toward myself', 'On the whole, I am satisfied with myself', 'I wish I could have more respect for myself', 'I certainly feel useless at times', 'At times I think I am no good at all'].map((en) => ({ en, ur: urduQuestion(en) })), max: 40, options: [1, 2, 3, 4], score: (a) => a.reduce((x, y, i) => x + ([2, 4, 7, 8, 9].includes(i) ? 5 - y : y), 0), band: (s) => s < 15 ? 'Lower self-esteem range' : s < 25 ? 'Average range' : 'Higher self-esteem range' },
  { id: 'swls', name: 'SWLS', urdu: 'زندگی سے اطمینان کی خود جانچ', description: 'Five statements about your overall satisfaction with life.', urduDescription: 'زندگی سے مجموعی اطمینان کے بارے میں پانچ سوالات۔', questions: ['In most ways my life is close to my ideal', 'The conditions of my life are excellent', 'I am satisfied with my life', 'So far I have gotten the important things I want in life', 'If I could live my life over, I would change almost nothing'].map((en) => ({ en, ur: urduQuestion(en) })), max: 35, options: [1, 2, 3, 4, 5, 6, 7], score: (a) => a.reduce((x, y) => x + y, 0), band: (s) => s < 15 ? 'Lower satisfaction range' : s < 25 ? 'Average satisfaction range' : 'Higher satisfaction range' },
];
const answerScale = (id: string, lang: Lang) => {
  if (id === 'swls') return lang === 'ur' ? ['سخت اختلاف', 'اختلاف', 'کچھ اختلاف', 'نہ اختلاف نہ اتفاق', 'کچھ اتفاق', 'اتفاق', 'مکمل اتفاق'] : ['Strongly disagree', 'Disagree', 'Slightly disagree', 'Neither', 'Slightly agree', 'Agree', 'Strongly agree'];
  if (id === 'bfi10') return lang === 'ur' ? ['بالکل متفق نہیں', 'کچھ متفق نہیں', 'درمیانہ', 'کچھ متفق', 'مکمل متفق'] : ['Disagree strongly', 'Disagree a little', 'Neither', 'Agree a little', 'Agree strongly'];
  if (id === 'rses') return lang === 'ur' ? ['سخت اختلاف', 'اختلاف', 'اتفاق', 'مکمل اتفاق'] : ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'];
  if (id === 'pss10') return lang === 'ur' ? ['کبھی نہیں', 'تقریباً کبھی نہیں', 'کبھی کبھار', 'اکثر', 'بہت اکثر'] : ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'];
  return lang === 'ur' ? ['بالکل نہیں', 'کئی دن', 'آدھے سے زیادہ دن', 'تقریباً ہر روز'] : ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
};
const localizeBand = (band: string, lang: Lang) => lang === 'en' ? band : ({
  'Minimal range': 'کم سے کم حد',
  'Mild range': 'ہلکی حد',
  'Moderate range': 'درمیانی حد',
  'Severe range': 'شدید حد',
  'Moderately severe range': 'درمیانی سے شدید حد',
  'Lower perceived stress': 'محسوس شدہ کم تناؤ',
  'Moderate perceived stress': 'محسوس شدہ درمیانی تناؤ',
  'Higher perceived stress': 'محسوس شدہ زیادہ تناؤ',
  'Lower endorsement': 'کم اتفاق',
  'Mixed endorsement': 'ملا جلا اتفاق',
  'Higher endorsement': 'زیادہ اتفاق',
  'Lower self-esteem range': 'کم خود اعتمادی کی حد',
  'Average range': 'اوسط حد',
  'Higher self-esteem range': 'زیادہ خود اعتمادی کی حد',
  'Lower satisfaction range': 'کم اطمینان کی حد',
  'Average satisfaction range': 'اوسط اطمینان کی حد',
  'Higher satisfaction range': 'زیادہ اطمینان کی حد',
} as Record<string, string>)[band] ?? band;
const crisisPattern = /suicid|kill myself|end my life|hurt myself|self[- ]?harm|want to die|better off dead|can't stay safe|cannot stay safe|مر جانا|خودکشی|خود کو نقصان|اپنے آپ کو نقصان|زندگی ختم|محفوظ نہیں/;
const isCrisisLanguage = (message: string) => crisisPattern.test(message.toLocaleLowerCase());
const getSafetyResponse = (lang: Lang) => copy[lang].ariaSafetyBody;
function getAIResponse(message: string, lang: Lang, history: ChatMessage[] = []) {
  const t = copy[lang];
  const normalized = message.toLocaleLowerCase();
  const mentionsAnxiety = /anxious|anxiety|panic|worry|worried|stress|بے چین|گھبراہٹ|فکر|تناؤ/.test(normalized);
  const mentionsSleep = /sleep|سونا|نیند|rest/.test(normalized);
  const mentionsSadness = /sad|empty|lonely|depressed|اداس|تنہا|خالی|مایوس/.test(normalized);
  const mentionsStudy = /exam|study|student|class|assignment|test|امتحان|پڑھائی|طالب علم|کلاس|اسائنمنٹ/.test(normalized);
  const mentionsWork = /work|job|office|boss|career|کام|نوکری|دفتر|باس|روزگار/.test(normalized);
  const mentionsAnger = /angry|anger|frustrat|irritat|غصہ|ناراض|جھنجھلا|چڑچڑا/.test(normalized);
  const mentionsConnection = /alone|lonely|friend|family|relationship|partner|اکیلا|تنہا|دوست|خاندان|رشتہ|ساتھی/.test(normalized);
  const mentionsSelfCriticism = /failure|worthless|guilty|blame|not good enough|ناکام|بے کار|قصور|خود کو الزام|کافی اچھا/.test(normalized);
  const isGreeting = /^(hi|hello|hey|salam|assalam|سلام|ہیلو|السلام علیکم)\b/.test(normalized.trim());
  const previousAssistant = history.filter((chat) => chat.role === 'assistant').length;
  const gentleQuestion = lang === 'ur'
    ? 'اس وقت آپ کے لیے سب سے چھوٹا، قابلِ عمل قدم کیا ہو سکتا ہے؟'
    : 'What feels like the smallest doable step from here?';

  if (lang === 'ur') {
    if (isGreeting) return 'وعلیکم السلام۔ میں یہاں آپ کی بات سننے اور اسے تھوڑا آہستہ کرنے کے لیے ہوں۔ آج آپ کے ذہن میں سب سے نمایاں بات کیا ہے؟';
    if (mentionsAnxiety) return 'آپ کی بے چینی کو سنجیدگی سے لیا جا سکتا ہے۔ اپنے پاؤں زمین پر محسوس کریں، چار آہستہ سانسیں لیں، اور اپنے اردگرد کی تین چیزوں کے نام لیں۔ اس وقت آپ کے اختیار میں سب سے چھوٹی چیز کیا ہے؟';
    if (mentionsSleep) return 'نیند کے لیے ابھی سب کچھ حل کرنا ضروری نہیں۔ روشنی کم کریں، فون کچھ دیر دور رکھیں، اور اپنے جسم کو آہستہ آہستہ ڈھیلا ہونے دیں۔ کیا کوئی خیال بار بار واپس آ رہا ہے؟';
    if (mentionsSadness) return 'یہ احساس اکیلے اٹھانا مشکل ہو سکتا ہے۔ آپ کو ابھی خود سے سب کچھ ٹھیک کرنے کی ضرورت نہیں۔ کسی قابلِ اعتماد شخص کو ایک مختصر پیغام بھیجنا کیسا رہے گا؟';
    if (mentionsStudy) return 'امتحان یا پڑھائی کا دباؤ واقعی بھاری لگ سکتا ہے۔ پورا کام ایک ساتھ اٹھانے کے بجائے صرف دس منٹ کا ایک حصہ چنیں، مثلاً ایک سوال یا ایک صفحہ۔ کیا ابھی آپ کو منصوبہ چاہیے یا پہلے ذہن ہلکا کرنا ہے؟';
    if (mentionsWork) return 'کام یا نوکری کا دباؤ اکثر ذہن کو مسلسل چوکس رکھتا ہے۔ ایک لمحے کے لیے یہ الگ کریں کہ کیا فوری ہے اور کیا آج انتظار کر سکتا ہے۔ ' + gentleQuestion;
    if (mentionsAnger) return 'غصہ اکثر اس بات کا اشارہ ہوتا ہے کہ کوئی حد، ضرورت یا ناانصافی نظر انداز ہوئی ہے۔ جواب دینے سے پہلے چند لمحے رک کر جسم میں غصے کی جگہ محسوس کریں۔ کیا آپ بتانا چاہیں گے کہ اصل تکلیف کس بات سے ہوئی؟';
    if (mentionsConnection) return 'کسی سے جڑنے کی خواہش اور ساتھ ہی تنہائی محسوس کرنا بہت انسانی بات ہے۔ کسی قابلِ اعتماد شخص کو صرف اتنا لکھ سکتے ہیں: “آج بات کرنے کی ضرورت ہے۔” کیا کوئی ایسا شخص ذہن میں آ رہا ہے؟';
    if (mentionsSelfCriticism) return 'اپنے آپ کو سخت الفاظ میں پرکھنا اس لمحے کو اور بھاری بنا سکتا ہے۔ جو بات آپ اپنے کسی دوست سے نرمی سے کہتے، وہی اپنے لیے بھی آزما کر دیکھیں۔ ' + gentleQuestion;
    if (previousAssistant > 1) return 'میں آپ کی بات کے ساتھ ہوں۔ ہم اسے ایک ہی بار میں حل کرنے کے بجائے ایک حصے میں دیکھ سکتے ہیں۔ اس وقت سب سے زیادہ توجہ کس چیز کو چاہیے؟';
    return message.length > 90 ? t.ariaFallback2 : t.ariaFallback;
  }

  if (isGreeting) return 'Hello. I am here to listen and help make the moment a little slower. What feels most present for you today?';
  if (mentionsAnxiety) return 'That sounds unsettling. Let us make this moment smaller: feel both feet on the floor, take four slow breaths, and name three things you can see. What is one small part of this situation that is within your control?';
  if (mentionsSleep) return 'You do not have to solve everything before resting. Lower the light, put your phone a little farther away, and notice where your body can soften. Is there one thought that keeps returning?';
  if (mentionsSadness) return 'That sounds heavy to carry alone. You do not need to fix the whole day right now. Would it feel possible to send one simple message to someone you trust?';
  if (mentionsStudy) return 'Exam or study pressure can make the whole future feel urgent. Instead of carrying the entire task, choose a ten-minute piece — one question, one paragraph, or one outline. Do you need a small plan right now, or room to let the feeling out first?';
  if (mentionsWork) return 'Work pressure can keep your mind on alert long after the workday ends. It may help to separate what is urgent from what can wait until tomorrow. ' + gentleQuestion;
  if (mentionsAnger) return 'Anger can point to a crossed boundary, an unmet need, or something that felt unfair. Before responding, pause long enough to notice where it sits in your body. What part of the situation hurt underneath the anger?';
  if (mentionsConnection) return 'Wanting connection while feeling alone can be especially painful. You could send someone you trust a low-pressure message: “I could use a little company today.” Is there anyone who feels safe enough to try?';
  if (mentionsSelfCriticism) return 'The way we speak to ourselves can make a hard moment heavier. Try describing what happened as if you were speaking to a friend you care about, without turning it into a verdict about your worth. ' + gentleQuestion;
  if (previousAssistant > 1) return 'I am still with you. We do not have to solve the whole situation in one conversation; we can stay with one part of it at a time. What needs the most attention right now?';
  return message.length > 90 ? t.ariaFallback2 : t.ariaFallback;
}

type Exercise = { id: string; icon: typeof Wind; title: string; urdu: string; desc: string; urduDesc: string; mins: number; steps: { en: string; ur: string }[]; moods: Mood[] };
const exerciseData: Exercise[] = [
  { id: 'breathing', icon: Wind, title: 'Box breathing', urdu: 'چار مرحلوں والی سانس', desc: 'A simple rhythm to help your body find a slower gear.', urduDesc: 'جسم کو آہستہ ہونے میں مدد دینے والی سادہ لے۔', mins: 3, steps: [{ en: 'Sit comfortably and soften your shoulders.', ur: 'آرام سے بیٹھیں اور کندھوں کو ڈھیلا چھوڑ دیں۔' }, { en: 'Breathe in gently for four counts.', ur: 'چار گنتی تک نرمی سے سانس اندر لیں۔' }, { en: 'Pause for four, breathe out for four, then pause for four.', ur: 'چار گنتی روکیں، چار گنتی میں باہر نکالیں، پھر چار گنتی وقفہ کریں۔' }], moods: ['low', 'uneasy', 'steady'] },
  { id: 'grounding', icon: Compass, title: '5–4–3–2–1 grounding', urdu: 'پانچ حواس کی گراؤنڈنگ', desc: 'Return to the room around you, one sense at a time.', urduDesc: 'ایک ایک حس کے ذریعے اپنے اردگرد کے کمرے میں واپس آئیں۔', mins: 5, steps: [{ en: 'Name five things you can see.', ur: 'پانچ چیزوں کے نام لیں جو آپ دیکھ سکتے ہیں۔' }, { en: 'Notice four things you can feel, three you can hear.', ur: 'چار چیزیں محسوس کریں، تین آوازیں سنیں۔' }, { en: 'Find two scents and one taste. Let your feet meet the floor.', ur: 'دو خوشبوئیں اور ایک ذائقہ محسوس کریں۔ پاؤں کو فرش پر محسوس کریں۔' }], moods: ['uneasy', 'low'] },
  { id: 'gratitude', icon: Star, title: 'Three honest gratitudes', urdu: 'تین سچے شکرانے', desc: 'Notice what is nourishing without forcing a silver lining.', urduDesc: 'بغیر زبردستی مثبت پہلو ڈھونڈے، جو سہارا دے رہا ہے اسے دیکھیں۔', mins: 4, steps: [{ en: 'Name one ordinary thing that helped today.', ur: 'آج مدد دینے والی ایک عام چیز کا نام لیں۔' }, { en: 'Name one person, place, or memory you appreciate.', ur: 'کسی شخص، جگہ یا یاد کا نام لیں جس کی قدر ہے۔' }, { en: 'Name one quality in yourself that carried you here.', ur: 'اپنی ایک خوبی کا نام لیں جو آپ کو یہاں تک لائی۔' }], moods: ['low', 'steady', 'good'] },
  { id: 'muscle', icon: Zap, title: 'Progressive muscle release', urdu: 'تدریجی عضلاتی سکون', desc: 'Tense and release gently, moving attention through the body.', urduDesc: 'جسم پر توجہ لاتے ہوئے نرمی سے کھینچیں اور چھوڑیں۔', mins: 7, steps: [{ en: 'Start with your hands. Make a gentle fist for five seconds.', ur: 'ہاتھوں سے شروع کریں۔ پانچ سیکنڈ نرمی سے مٹھی بنائیں۔' }, { en: 'Release slowly and notice the contrast.', ur: 'آہستہ چھوڑیں اور فرق محسوس کریں۔' }, { en: 'Move through shoulders, face, belly, and feet. Skip anything painful.', ur: 'کندھوں، چہرے، پیٹ اور پاؤں تک جائیں۔ تکلیف ہو تو چھوڑ دیں۔' }], moods: ['uneasy', 'low'] },
  { id: 'visualization', icon: Leaf, title: 'A safe-enough place', urdu: 'ایک محفوظ سی جگہ', desc: 'Build a sensory picture of somewhere your body can soften.', urduDesc: 'ایسی جگہ کا حسی تصور بنائیں جہاں جسم ڈھیلا ہو سکے۔', mins: 6, steps: [{ en: 'Picture a place, real or imagined, with a little ease.', ur: 'حقیقی یا خیالی ایسی جگہ سوچیں جہاں کچھ سکون ہو۔' }, { en: 'Add three details: light, sound, and texture.', ur: 'تین تفصیل شامل کریں: روشنی، آواز اور ساخت۔' }, { en: 'Stay for a few breaths. You can leave whenever you choose.', ur: 'چند سانسوں تک وہاں رہیں۔ جب چاہیں واپس آ سکتے ہیں۔' }], moods: ['uneasy', 'low', 'steady'] },
  { id: 'reframe', icon: Brain, title: 'Name the thought, widen the frame', urdu: 'خیال کو نام دیں، نظر وسیع کریں', desc: 'Make room between a difficult thought and a fixed conclusion.', urduDesc: 'مشکل خیال اور حتمی نتیجے کے درمیان جگہ بنائیں۔', mins: 5, steps: [{ en: 'Write the thought exactly as it arrives.', ur: 'خیال کو اسی طرح لکھیں جیسے آیا ہے۔' }, { en: 'Ask: what facts support it, and what facts are missing?', ur: 'پوچھیں: کون سے حقائق اس کی تائید کرتے ہیں، اور کیا رہ گیا ہے؟' }, { en: 'Try a kinder, more complete sentence — not a forced positive one.', ur: 'ایک مہربان اور مکمل جملہ آزمائیں — زبردستی مثبت نہیں۔' }], moods: ['uneasy', 'low', 'steady'] },
  { id: 'tiny-step', icon: Play, title: 'The next ten minutes', urdu: 'اگلے دس منٹ', desc: 'Turn an overwhelming day into one small, doable action.', urduDesc: 'بہت بھاری دن کو ایک چھوٹے، قابلِ عمل قدم میں بدلیں۔', mins: 3, steps: [{ en: 'Choose one task that would make the next ten minutes kinder.', ur: 'ایک ایسا کام چنیں جو اگلے دس منٹ کو آسان بنائے۔' }, { en: 'Make it smaller than your first instinct.', ur: 'اپنی پہلی سوچ سے بھی اسے چھوٹا کریں۔' }, { en: 'Begin for two minutes. Stopping is allowed.', ur: 'دو منٹ کے لیے شروع کریں۔ رکنا بھی جائز ہے۔' }], moods: ['low', 'uneasy', 'steady'] },
  { id: 'self-compassion', icon: Heart, title: 'Speak to yourself as a friend', urdu: 'دوست کی طرح خود سے بات', desc: 'Offer yourself the tone you would offer someone you love.', urduDesc: 'اپنے لیے وہی لہجہ اپنائیں جو کسی عزیز کے لیے اپناتے۔', mins: 4, steps: [{ en: 'Notice the hard thing without arguing with it.', ur: 'مشکل بات کو بغیر بحث کے محسوس کریں۔' }, { en: 'Say: this is hard, and I am not the only person who feels this.', ur: 'کہیں: یہ مشکل ہے، اور صرف میں ہی ایسا محسوس نہیں کرتا۔' }, { en: 'Ask what a caring friend would suggest for tonight.', ur: 'پوچھیں کہ خیال رکھنے والا دوست آج رات کے لیے کیا مشورہ دیتا۔' }], moods: ['low', 'uneasy'] },
  { id: 'unplug', icon: Clock3, title: 'A soft reset', urdu: 'نرم سا ری سیٹ', desc: 'A short pause to shift from stimulation into presence.', urduDesc: 'توجہ واپس لانے کے لیے مصروفیت سے ایک مختصر وقفہ۔', mins: 2, steps: [{ en: 'Put one screen face down and unclench your jaw.', ur: 'ایک اسکرین الٹی رکھیں اور جبڑا ڈھیلا کریں۔' }, { en: 'Take three unhurried breaths and drink some water.', ur: 'تین بے جلد سانسیں لیں اور پانی پئیں۔' }, { en: 'Choose what deserves your attention next.', ur: 'چنیں کہ اگلی توجہ کس چیز کو دینی ہے۔' }], moods: ['good', 'bright', 'steady'] },
];

type SupportListing = {
  id: string;
  name: string;
  kind: string;
  kindUr: string;
  area: string;
  areaUr: string;
  address: string;
  addressUr: string;
  description: string;
  descriptionUr: string;
  hours: string;
  hoursUr: string;
  phone?: string;
  phoneHref?: string;
  website: string;
};

const supportListings: SupportListing[] = [
  {
    id: 'karwan-korangi',
    name: 'Karwan-e-Hayat',
    kind: 'Psychiatric care · assessments · rehabilitation',
    kindUr: 'نفسیاتی نگہداشت · جانچ · بحالی',
    area: 'Korangi',
    areaUr: 'کورنگی',
    address: 'Community Psychiatric Center, Sector 48-H, Qabrastan Road, Creek General Hospital',
    addressUr: 'کمیونٹی سائیکائٹرک سینٹر، سیکٹر 48-H، قبرستان روڈ، کریک جنرل ہسپتال',
    description: 'Non-profit mental-health care with psychiatric consultation, psychological assessments, rehabilitation, and tele-psychiatry.',
    descriptionUr: 'غیر منافع بخش ذہنی صحت کی تنظیم؛ نفسیاتی مشاورت، نفسیاتی جانچ، بحالی اور ٹیلی سائیکائٹری کی سہولت۔',
    hours: 'Confirm current timings',
    hoursUr: 'موجودہ اوقات چیک کریں',
    phone: '(021) 111-534-111',
    phoneHref: 'tel:+9221111534111',
    website: 'https://keh.org.pk/services/',
  },
  {
    id: 'karwan-keamari',
    name: 'Karwan-e-Hayat',
    kind: 'Psychiatric care · subsidized services',
    kindUr: 'نفسیاتی نگہداشت · رعایتی خدمات',
    area: 'Keamari',
    areaUr: 'کیماڑی',
    address: 'PCRC, Buildings KV 27 & 28, near KPT Hospital',
    addressUr: 'PCRC، عمارتیں KV 27 اور 28، کے پی ٹی ہسپتال کے قریب',
    description: 'A Karachi mental-health organization offering care and rehabilitation, including support for underserved communities.',
    descriptionUr: 'کراچی کی ذہنی صحت کی تنظیم جو کم سہولیات والے لوگوں سمیت نگہداشت اور بحالی کی خدمات فراہم کرتی ہے۔',
    hours: 'Confirm current timings',
    hoursUr: 'موجودہ اوقات چیک کریں',
    phone: '(021) 111-534-111',
    phoneHref: 'tel:+9221111534111',
    website: 'https://keh.org.pk/',
  },
  {
    id: 'taskeen-dha',
    name: 'Taskeen',
    kind: 'Free telephonic support · online screening',
    kindUr: 'مفت ٹیلی فونک مدد · آن لائن جانچ',
    area: 'DHA',
    areaUr: 'ڈی ایچ اے',
    address: '3rd Floor, Plot 73C, Jami Commercial, Phase 7, DHA',
    addressUr: 'تیسری منزل، پلاٹ 73C، جامی کمرشل، فیز 7، ڈی ایچ اے',
    description: 'Free-of-cost telephonic mental-health support from Monday to Saturday, 11 AM–11 PM, with trained professionals.',
    descriptionUr: 'پیر تا ہفتہ صبح 11 بجے سے رات 11 بجے تک تربیت یافتہ ماہرین کی مفت ٹیلی فونک ذہنی صحت مدد۔',
    hours: 'Mon–Sat · 11 AM–11 PM',
    hoursUr: 'پیر تا ہفتہ · صبح 11 تا رات 11',
    phone: '0316 8275336',
    phoneHref: 'tel:+923168275336',
    website: 'https://taskeen.org/seek-help',
  },
  {
    id: 'kph-nazimabad',
    name: 'Karachi Psychiatric Hospital',
    kind: 'Psychiatric hospital · 24/7 contact',
    kindUr: 'نفسیاتی ہسپتال · 24/7 رابطہ',
    area: 'Nazimabad',
    areaUr: 'ناظم آباد',
    address: 'B, 1/14, Nazimabad #3, Karachi',
    addressUr: 'B، 1/14، ناظم آباد نمبر 3، کراچی',
    description: 'Psychiatric care and support with a head office in Nazimabad. Contact the hospital directly for current services and availability.',
    descriptionUr: 'ناظم آباد میں مرکزی دفتر کے ساتھ نفسیاتی نگہداشت اور مدد۔ موجودہ خدمات اور دستیابی کے لیے ہسپتال سے براہِ راست رابطہ کریں۔',
    hours: '24/7 contact listed',
    hoursUr: '24/7 رابطہ درج ہے',
    phone: '021-36708092',
    phoneHref: 'tel:+922136708092',
    website: 'https://kphonline.com.pk/contact-us/',
  },
  {
    id: 'kph-north-nazimabad',
    name: 'Karachi Psychiatric Hospital',
    kind: 'Psychiatric care · North Nazimabad branch',
    kindUr: 'نفسیاتی نگہداشت · نارتھ ناظم آباد برانچ',
    area: 'North Nazimabad',
    areaUr: 'نارتھ ناظم آباد',
    address: 'Mubin House, D-58, Block B, North Nazimabad, Karachi',
    addressUr: 'مبین ہاؤس، D-58، بلاک B، نارتھ ناظم آباد، کراچی',
    description: 'North Nazimabad branch listed by Karachi Psychiatric Hospital. Confirm appointments, fees, and available services directly.',
    descriptionUr: 'کراچی سائیکائٹرک ہسپتال کی درج کردہ نارتھ ناظم آباد برانچ۔ اپائنٹمنٹ، فیس اور دستیاب خدمات براہِ راست چیک کریں۔',
    hours: 'Confirm current timings',
    hoursUr: 'موجودہ اوقات چیک کریں',
    phone: '021-36646944',
    phoneHref: 'tel:+922136646944',
    website: 'https://kphonline.com.pk/contact-us/',
  },
];

function Button({ children, variant = 'primary', className = '', ...props }: { children: ReactNode; variant?: 'primary' | 'quiet' | 'outline' | 'danger'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`pw-btn pw-btn-${variant} ${className}`} {...props}>{children}</button>;
}
function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`pw-card ${className}`} {...props}>{children}</div>;
}
function PageHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return <header className="page-heading page-enter"><div className="eyebrow">{eyebrow}</div><h1 className="font-serif">{title}</h1>{body && <p>{body}</p>}</header>;
}
function LocalBadge({ lang, short = false }: { lang: Lang; short?: boolean }) {
  const t = copy[lang];
  return <div className="local-badge" data-testid="status-local-storage"><LockKeyhole size={14} /> <span>{short ? t.savedShort : t.saved}</span></div>;
}
function Logo({ lang }: { lang: Lang }) {
  return <div className="brand"><span className="brand-mark"><span /></span><div><strong>{copy[lang].appName}</strong><small>{copy[lang].mark}</small></div></div>;
}

function Onboarding({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [language, setLanguage] = useState<Lang>(settings.language);
  const t = copy[language];
  return <main className={`welcome-screen ${language === 'ur' ? 'rtl' : ''}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>
    <div className="welcome-orbit orbit-one" /><div className="welcome-orbit orbit-two" />
    <div className="welcome-top"><Logo lang={language} /><div className="language-pills" role="group" aria-label={t.chooseLanguage}>
      <button data-testid="button-language-en" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>EN</button>
      <button data-testid="button-language-ur" className={language === 'ur' ? 'selected' : ''} onClick={() => setLanguage('ur')}>اردو</button>
    </div></div>
    <section className="welcome-content page-enter">
      <div className="welcome-kicker"><span className="kicker-line" /> {t.mark}</div>
      <h1 className="font-serif" data-testid="text-welcome-title">{t.welcomeTitle}</h1>
      <p>{t.welcomeBody}</p>
      <Button data-testid="button-begin-onboarding" onClick={() => setSettings({ ...settings, language, onboarded: true })}>{t.begin} <ArrowRight size={17} /></Button>
      <div className="welcome-foot"><ShieldCheck size={16} /><span>{t.welcomeFoot}</span></div>
    </section>
    <div className="welcome-seal"><span>PW</span><small>local<br />only</small></div>
  </main>;
}

const navItems = [
  { id: '/', key: 'home', icon: HomeIcon }, { id: '/journal', key: 'journal', icon: BookOpen }, { id: '/aria', key: 'aria', icon: MessageCircle },
  { id: '/assessments', key: 'assessments', icon: BarChart3 }, { id: '/exercises', key: 'exercises', icon: Wind }, { id: '/specialists', key: 'specialists', icon: Compass }, { id: '/settings', key: 'settings', icon: SettingsIcon },
] as const;

function Shell({ lang, location, setLocation, children }: { lang: Lang; location: string; setLocation: (path: string) => void; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[lang];
  return <div className={`app-shell paper-grain ${lang === 'ur' ? 'rtl' : ''}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}><div className="sidebar-top"><Logo lang={lang} /><button className="mobile-close" aria-label={t.close} onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <nav className="side-nav">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} data-testid={`link-nav-${item.key}`} className={location === item.id ? 'active' : ''} onClick={() => { setLocation(item.id); setMenuOpen(false); }}><Icon size={18} /><span>{t.nav[item.key as keyof typeof t.nav]}</span>{location === item.id && <span className="nav-dot" />}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><ShieldCheck size={16} /><span>{lang === 'ur' ? 'آپ کا ڈیٹا آپ کے پاس' : 'Your data stays with you'}</span></div><button className="sidebar-settings" onClick={() => setLocation('/settings')}><SettingsIcon size={15} /> {t.nav.settings}</button></div>
    </aside>
    <div className="main-wrap"><header className="mobile-header"><button className="icon-btn" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><Logo lang={lang} /><LocalBadge lang={lang} short /></header><div className="desktop-status"><LocalBadge lang={lang} /></div>{children}</div>
    <nav className="mobile-nav">{navItems.slice(0, 5).map((item) => { const Icon = item.icon; return <button key={item.id} data-testid={`mobile-nav-${item.key}`} className={location === item.id ? 'active' : ''} onClick={() => setLocation(item.id)}><Icon size={19} /><span>{t.nav[item.key as keyof typeof t.nav]}</span></button>; })}</nav>
  </div>;
}

function MoodPicker({ lang, value, onChange }: { lang: Lang; value: Mood | null; onChange: (mood: Mood) => void }) {
  return <div className="mood-picker">{moods.map((item) => <button key={item.id} data-testid={`button-mood-${item.id}`} className={value === item.id ? 'selected' : ''} onClick={() => onChange(item.id)}><span className="mood-orb" style={{ backgroundColor: item.color }} /><span>{lang === 'ur' ? item.ur : item.en}</span></button>)}</div>;
}

function MoodChart({ logs, lang, compact = false }: { logs: MoodLog[]; lang: Lang; compact?: boolean }) {
  const shown = logs.slice(-7);
  if (!shown.length) return <div className={`chart-empty ${compact ? 'compact' : ''}`}><BarChart3 size={22} /><span>{copy[lang].noMoods}</span></div>;
  const points = shown.map((log, i) => `${shown.length === 1 ? 50 : (i / (shown.length - 1)) * 100},${82 - (moodFor(log.mood).value - 1) * 16}`).join(' ');
  return <div className={`mood-chart ${compact ? 'compact' : ''}`}><div className="chart-y"><span>5</span><span>3</span><span>1</span></div><div className="chart-main"><svg viewBox="0 0 100 90" preserveAspectRatio="none" aria-label={copy[lang].trend}><line x1="0" y1="82" x2="100" y2="82" /><line x1="0" y1="50" x2="100" y2="50" /><line x1="0" y1="18" x2="100" y2="18" /><polyline points={points} fill="none" /><g>{shown.map((log, i) => <circle key={log.id} cx={shown.length === 1 ? 50 : (i / (shown.length - 1)) * 100} cy={82 - (moodFor(log.mood).value - 1) * 16} r="2.7" />)}</g></svg><div className="chart-x">{shown.map((log) => <span key={log.id}>{formatDate(log.createdAt, lang)}</span>)}</div></div></div>;
}

function HomePage({ lang, moodsLogs, journals, onMood, setLocation }: { lang: Lang; moodsLogs: MoodLog[]; journals: JournalEntry[]; onMood: (mood: Mood) => void; setLocation: (path: string) => void }) {
  const t = copy[lang]; const [selected, setSelected] = useState<Mood | null>(null); const latest = moodsLogs[moodsLogs.length - 1]; const latestMood = latest ? moodFor(latest.mood) : null;
  const suggested = latestMood && (latestMood.value <= 2 ? exerciseData.find((e) => e.id === 'grounding') : latestMood.value === 3 ? exerciseData.find((e) => e.id === 'reframe') : exerciseData.find((e) => e.id === 'gratitude'))!;
  const submitMood = () => { if (selected) { onMood(selected); setSelected(null); } };
  return <main className="content page-enter"><div className="welcome-line"><div><div className="eyebrow">{formatDate(now(), lang)}</div><h1 className="font-serif">{t.goodMorning}</h1><p>{t.morningNote}</p></div><div className="avatar-mark">P</div></div>
    <div className="home-grid"><Card className="checkin-card stagger-in stagger-1"><div className="card-kicker"><span className="number-kicker">01</span><span>{t.checkin}</span></div><p className="muted">{t.checkinHint}</p><MoodPicker lang={lang} value={selected} onChange={setSelected} /><Button data-testid="button-save-mood" className="checkin-submit" disabled={!selected} onClick={submitMood}>{selected ? t.savedShort : t.checkin} {selected && <Check size={16} />}</Button></Card>
      <Card className="snapshot-card stagger-in stagger-2"><div className="card-title-row"><div><span className="eyebrow">{t.recent}</span><h2 className="font-serif">{latestMood ? (lang === 'ur' ? latestMood.ur : latestMood.en) : t.noMoods}</h2></div>{latestMood && <span className="mood-orb large" style={{ backgroundColor: latestMood.color }} />}</div><MoodChart logs={moodsLogs} lang={lang} compact /><div className="snapshot-foot"><span>{moodsLogs.length ? `${moodsLogs.length} ${t.entries}` : t.noMoodsBody}</span><BarChart3 size={16} /></div></Card>
    </div>
    <div className="home-lower"><Card className="suggestion-card stagger-in stagger-3"><div className="suggestion-art"><span className="sun-disc" /><span className="art-line line-a" /><span className="art-line line-b" /><span className="art-leaf" /></div><div className="suggestion-copy"><span className="eyebrow">{t.suggested}</span><h2 className="font-serif">{suggested ? (lang === 'ur' ? suggested.urdu : suggested.title) : (lang === 'ur' ? 'سانس کے ساتھ ٹھہریں' : 'Start with one breath')}</h2><p>{suggested ? (lang === 'ur' ? suggested.urduDesc : suggested.desc) : t.basedOn}</p><Button variant="outline" onClick={() => setLocation(`/exercises${suggested ? `?open=${suggested.id}` : ''}`)}>{t.openExercise} <ArrowRight size={16} /></Button></div></Card>
      <Card className="privacy-card stagger-in stagger-4"><div className="privacy-icon"><LockKeyhole size={19} /></div><span className="eyebrow">{t.savedShort}</span><h2 className="font-serif">{t.privacyTitle}</h2><p>{t.privacyBody}</p><button data-testid="link-privacy-settings" className="text-link" onClick={() => setLocation('/settings')}>{t.learnMore} <ArrowRight size={15} /></button></Card></div>
    {journals.length > 0 && <section className="home-recent stagger-in stagger-5"><div className="section-heading"><div><span className="eyebrow">{t.journalTitle}</span><h2 className="font-serif">{t.history}</h2></div><button className="text-link" onClick={() => setLocation('/journal')}>{t.nav.journal} <ArrowRight size={15} /></button></div><div className="mini-entry-row">{journals.slice(-3).reverse().map((entry) => <div className="mini-entry" key={entry.id}><span className="mood-orb small" style={{ backgroundColor: moodFor(entry.mood).color }} /><div><strong>{formatDate(entry.createdAt, lang)}</strong><p>{entry.text.slice(0, 55)}{entry.text.length > 55 ? '…' : ''}</p></div></div>)}</div></section>}
  </main>;
}

function JournalPage({ lang, journals, onAdd, onDelete }: { lang: Lang; journals: JournalEntry[]; onAdd: (entry: JournalEntry) => void; onDelete: (id: string) => void }) {
  const t = copy[lang]; const [open, setOpen] = useState(false); const [mood, setMood] = useState<Mood | null>(null); const [text, setText] = useState(''); const [reflection, setReflection] = useState(''); const [notice, setNotice] = useState(false);
  const submit = () => { if (!mood || !text.trim()) return; onAdd({ id: uid(), createdAt: now(), mood, text: text.trim(), reflection: reflection.trim() }); setText(''); setReflection(''); setMood(null); setOpen(false); setNotice(true); setTimeout(() => setNotice(false), 2200); };
  return <main className="content page-enter"><PageHeading eyebrow={t.nav.journal} title={t.journalTitle} body={t.journalBody} /><div className="journal-toolbar"><div className="toolbar-note"><PenLine size={17} /><span>{journals.length} {t.entries}</span></div><Button data-testid="button-new-journal" onClick={() => setOpen(!open)}>{open ? <X size={16} /> : <PenLine size={16} />} {open ? t.cancel : t.newEntry}</Button></div>
    {notice && <div className="save-notice" data-testid="status-journal-saved"><Check size={16} /> {t.entrySaved}</div>}
    {open && <Card className="journal-editor stagger-in"><div className="editor-label"><span>01</span><label>{t.mood}</label></div><MoodPicker lang={lang} value={mood} onChange={setMood} /><label className="field-label" htmlFor="journal-text">{t.entryText}</label><textarea id="journal-text" data-testid="input-journal-text" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.entryPlaceholder} rows={5} /><label className="field-label" htmlFor="journal-reflection">{t.reflection}</label><textarea id="journal-reflection" data-testid="input-journal-reflection" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder={t.reflectionPlaceholder} rows={3} /><div className="editor-actions"><Button variant="quiet" onClick={() => setOpen(false)}>{t.cancel}</Button><Button data-testid="button-save-journal" disabled={!mood || !text.trim()} onClick={submit}>{t.saveEntry} <Check size={16} /></Button></div></Card>}
    <div className="journal-layout"><section><div className="section-heading"><div><span className="eyebrow">{t.history}</span><h2 className="font-serif">{journals.length ? `${journals.length} ${t.entries}` : t.emptyJournal}</h2></div></div>{journals.length ? <div className="timeline">{journals.slice().reverse().map((entry, i) => <article className={`timeline-entry stagger-in stagger-${Math.min(i + 1, 5)}`} key={entry.id}><div className="timeline-marker"><span style={{ backgroundColor: moodFor(entry.mood).color }} /></div><div className="entry-date"><strong>{formatDate(entry.createdAt, lang)}</strong><span>{formatTime(entry.createdAt, lang)}</span></div><Card className="entry-card"><div className="entry-card-top"><span className="mood-label"><span className="mood-orb tiny" style={{ backgroundColor: moodFor(entry.mood).color }} />{lang === 'ur' ? moodFor(entry.mood).ur : moodFor(entry.mood).en}</span><button className="icon-btn subtle" aria-label={t.delete} onClick={() => window.confirm(t.confirmDelete) && onDelete(entry.id)}><Trash2 size={15} /></button></div><p data-testid={`text-journal-entry-${entry.id}`}>{entry.text}</p>{entry.reflection && <div className="reflection"><span>{t.reflection}</span><p>{entry.reflection}</p></div>}</Card></article>)}</div> : <div className="empty-state"><div className="empty-symbol"><BookOpen size={25} /></div><h3 className="font-serif">{t.emptyJournal}</h3><p>{t.emptyJournalBody}</p><Button variant="outline" onClick={() => setOpen(true)}>{t.newEntry} <PenLine size={16} /></Button></div>}</section><Card className="journal-trend"><div className="section-heading"><div><span className="eyebrow">{t.trend}</span><h2 className="font-serif">{t.recent}</h2></div></div><MoodChart logs={journals.map((j) => ({ id: j.id, mood: j.mood, createdAt: j.createdAt }))} lang={lang} /><div className="legend">{moods.slice(0, 5).map((m) => <span key={m.id}><i style={{ background: m.color }} />{lang === 'ur' ? m.ur : m.en}</span>)}</div></Card></div>
  </main>;
}

function AriaPage({ lang, chats, onSend, onClear }: { lang: Lang; chats: ChatMessage[]; onSend: (message: ChatMessage) => void; onClear: () => void }) {
  const t = copy[lang];
  const [text, setText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [safetyShown, setSafetyShown] = useState(false);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
  }, []);
  const send = async () => {
    if (!text.trim() || isThinking) return;
    const content = text.trim();
    onSend({ id: uid(), role: 'user', content, createdAt: now() });
    setText('');
    setIsThinking(true);
    if (isCrisisLanguage(content)) {
      onSend({ id: uid(), role: 'assistant', content: getSafetyResponse(lang), createdAt: now() });
      setSafetyShown(true);
      setIsThinking(false);
      return;
    }
    responseTimer.current = setTimeout(() => {
      onSend({ id: uid(), role: 'assistant', content: getAIResponse(content, lang, chats), createdAt: now() });
      setIsThinking(false);
      responseTimer.current = null;
    }, 320);
  };
  const clear = () => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    responseTimer.current = null;
    setIsThinking(false);
    setSafetyShown(false);
    onClear();
  };
  return <main className="content aria-page page-enter"><div className="aria-intro"><div className="aria-orb"><span>PW</span><div /></div><PageHeading eyebrow={t.nav.aria} title={t.ariaTitle} body={t.ariaBody} /></div><Card className="disclaimer"><CircleHelp size={17} /><p>{t.ariaDisclaimer}</p></Card><p className="mode-notice"><LockKeyhole size={15} />{t.ariaOfflineActive}</p>{safetyShown && <div className="aria-safety-note"><ShieldCheck size={16} /><span><strong>{t.ariaSafetyTitle}</strong>{t.ariaSafetyAck}</span></div>}<Card className="chat-card"><div className="chat-top"><div><strong>{t.nav.aria}</strong><span className="online-dot offline" /> <small>{t.ariaOfflineMode}</small></div>{chats.length > 0 && <button className="text-link" onClick={() => window.confirm(t.clearChat) && clear()}><Trash2 size={14} /> {t.clearChat}</button>}</div><div className="chat-log">{!chats.length ? <div className="chat-empty"><div className="chat-star"><Sparkles size={21} /></div><h3 className="font-serif">{t.chatEmpty}</h3><p>{t.chatEmptyBody}</p></div> : chats.map((message) => <div className={`chat-bubble-row ${message.role}`} key={message.id}><div className={`chat-bubble ${message.role}`} data-testid={`chat-message-${message.id}`}>{message.content}<span>{formatTime(message.createdAt, lang)}</span></div></div>)}{isThinking && <div className="chat-bubble-row assistant" aria-live="polite"><div className="chat-bubble assistant thinking-bubble"><span className="thinking-dots"><i /><i /><i /></span></div></div>}</div><div className="chat-input"><textarea data-testid="input-aria-message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={t.inputPlaceholder} rows={1} /><Button aria-label={t.send} data-testid="button-send-aria" onClick={() => void send()} disabled={!text.trim() || isThinking}><Send size={17} /></Button></div></Card></main>;
}

function AssessmentsPage({ lang, results, onResult }: { lang: Lang; results: AssessmentResult[]; onResult: (result: AssessmentResult) => void }) {
  const t = copy[lang]; const [active, setActive] = useState<Assessment | null>(null); const [step, setStep] = useState(0); const [answers, setAnswers] = useState<number[]>([]); const [finished, setFinished] = useState<AssessmentResult | null>(null);
  const begin = (assessment: Assessment) => { setActive(assessment); setStep(0); setAnswers([]); setFinished(null); };
  const choose = (value: number) => { const next = [...answers]; next[step] = value; setAnswers(next); };
  const complete = () => { if (!active) return; const score = active.score(answers); const result = { id: uid(), assessmentId: active.id, score, band: active.band(score), createdAt: now(), answers }; onResult(result); setFinished(result); };
  if (active && finished) return <main className="content page-enter"><button className="back-link" onClick={() => setActive(null)}><ArrowLeft size={16} /> {t.assessmentsTitle}</button><div className="result-panel"><div className="result-seal"><Check size={25} /></div><span className="eyebrow">{active.name} · {t.result}</span><h1 className="font-serif">{finished.score} <small>/ {active.max}</small></h1><div className="band-pill">{localizeBand(finished.band, lang)}</div><p>{t.selfScreening}</p><div className="result-note"><Info size={17} /><span>{t.notClinical}</span></div><div className="result-actions"><Button onClick={() => begin(active)}>{t.retake} <RotateCcw size={16} /></Button><Button variant="outline" onClick={() => setActive(null)}>{t.close}</Button></div></div></main>;
  if (active) { const question = active.questions[step]; const labels = answerScale(active.id, lang); const answered = answers[step] !== undefined; return <main className="content page-enter assessment-flow"><button className="back-link" onClick={() => setActive(null)}><ArrowLeft size={16} /> {t.back}</button><div className="flow-meta"><span>{active.name}</span><span>{t.questionOf.replace('{n}', String(step + 1)).replace('{total}', String(active.questions.length))}</span></div><div className="progress-track"><span style={{ width: `${((step + 1) / active.questions.length) * 100}%` }} /></div><section className="question-panel"><span className="question-number">0{step + 1}</span><h1 className="font-serif">{lang === 'ur' ? question.ur : question.en}</h1><div className="answer-list">{labels.map((label, i) => { const value = active.options[i]; return <button key={label} data-testid={`button-answer-${i}`} className={answers[step] === value ? 'selected' : ''} onClick={() => choose(value)}><span>{i + 1}</span>{label}{answers[step] === value && <Check size={17} />}</button>; })}</div><div className="flow-actions"><Button variant="quiet" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {t.back}</Button>{step === active.questions.length - 1 ? <Button disabled={!answered} onClick={complete}>{t.seeResult} <ArrowRight size={16} /></Button> : <Button disabled={!answered} onClick={() => setStep(step + 1)}>{t.next} <ArrowRight size={16} /></Button>}</div></section></main>; }
  return <main className="content page-enter"><PageHeading eyebrow={t.nav.assessments} title={t.assessmentsTitle} body={t.assessmentsBody} /><div className="assessment-layout"><section className="assessment-grid">{assessmentData.map((assessment, i) => { const previous = results.filter((r) => r.assessmentId === assessment.id).slice(-1)[0]; return <Card className={`assessment-card stagger-in stagger-${Math.min(i + 1, 5)}`} key={assessment.id}><div className="assessment-top"><span className="assessment-code">{assessment.name}</span><span className="assessment-count">{assessment.questions.length} {t.questions}</span></div><h2 className="font-serif">{lang === 'ur' ? assessment.urdu : assessment.name}</h2><p>{lang === 'ur' ? assessment.urduDescription : assessment.description}</p><div className="assessment-bottom">{previous ? <span className="previous-result">{t.lastTaken}: {formatDate(previous.createdAt, lang)}</span> : <span className="previous-result muted">{t.selfScreening}</span>}<Button variant="outline" data-testid={`button-start-${assessment.id}`} onClick={() => begin(assessment)}>{t.take} <ArrowRight size={15} /></Button></div></Card>; })}</section><Card className="results-history"><div className="section-heading"><div><span className="eyebrow">{t.result}</span><h2 className="font-serif">{t.history}</h2></div></div>{results.length ? results.slice().reverse().map((result) => <div className="result-row" key={result.id}><span className="result-code">{assessmentData.find((a) => a.id === result.assessmentId)?.name}</span><div><strong>{localizeBand(result.band, lang)}</strong><small>{formatDate(result.createdAt, lang)} · {result.score} {t.score}</small></div></div>) : <div className="small-empty"><BarChart3 size={21} /><p>{t.noResults}</p><small>{t.noResultsBody}</small></div>}</Card></div></main>;
}

function ExercisesPage({ lang }: { lang: Lang }) {
  const t = copy[lang]; const [active, setActive] = useState<Exercise | null>(null); const [step, setStep] = useState(0); const [seconds, setSeconds] = useState(0); const [running, setRunning] = useState(false); const latestQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('open') : null;
  useEffect(() => { if (latestQuery) { const found = exerciseData.find((e) => e.id === latestQuery); if (found) setActive(found); } }, [latestQuery]);
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setSeconds((s) => s + 1), 1000); return () => window.clearInterval(id); }, [running]);
  const open = (exercise: Exercise) => { setActive(exercise); setStep(0); setSeconds(0); setRunning(false); };
  if (active) { const ActiveIcon = active.icon; return <main className="content page-enter"><button className="back-link" onClick={() => setActive(null)}><ArrowLeft size={16} /> {t.exercisesTitle}</button><div className="exercise-detail"><div className="exercise-detail-art"><ActiveIcon size={38} /><span>{active.mins} {t.minutes}</span></div><span className="eyebrow">{t.nav.exercises}</span><h1 className="font-serif">{lang === 'ur' ? active.urdu : active.title}</h1><p className="detail-intro">{lang === 'ur' ? active.urduDesc : active.desc}</p><div className="practice-progress"><span>{t.step} {step + 1} / {active.steps.length}</span><div><i style={{ width: `${((step + 1) / active.steps.length) * 100}%` }} /></div></div><div className="step-card"><span className="step-index">0{step + 1}</span><p>{lang === 'ur' ? active.steps[step].ur : active.steps[step].en}</p></div><div className="timer-row"><div className="timer"><Clock3 size={16} /><strong>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong></div><button className="timer-toggle" onClick={() => setRunning(!running)}>{running ? t.pause : <><Play size={14} /> {t.start}</>}</button><button className="timer-reset" onClick={() => { setSeconds(0); setRunning(false); }}>{t.reset}</button></div><div className="flow-actions">{step > 0 ? <Button variant="quiet" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> {t.back}</Button> : <span />}{step === active.steps.length - 1 ? <Button onClick={() => setActive(null)}>{t.finish} <Check size={16} /></Button> : <Button onClick={() => setStep(step + 1)}>{t.next} <ArrowRight size={16} /></Button>}</div></div></main>; }
  return <main className="content page-enter"><PageHeading eyebrow={t.nav.exercises} title={t.exercisesTitle} body={t.exercisesBody} /><div className="exercise-grid">{exerciseData.map((exercise, i) => { const Icon = exercise.icon; return <button className={`exercise-card stagger-in stagger-${Math.min(i + 1, 5)}`} data-testid={`card-exercise-${exercise.id}`} key={exercise.id} onClick={() => open(exercise)}><div className="exercise-icon"><Icon size={21} /></div><div className="exercise-card-copy"><span className="eyebrow">{exercise.mins} {t.minutes} · {exercise.steps.length} {t.steps}</span><h2 className="font-serif">{lang === 'ur' ? exercise.urdu : exercise.title}</h2><p>{lang === 'ur' ? exercise.urduDesc : exercise.desc}</p></div><ArrowUpRight size={17} className="exercise-arrow" /></button>; })}</div></main>;
}

function SpecialistsPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');
  const areas = [
    { value: 'DHA', label: t.areaDha },
    { value: 'Korangi', label: t.areaKorangi },
    { value: 'Keamari', label: t.areaKeamari },
    { value: 'Nazimabad', label: t.areaNazimabad },
    { value: 'North Nazimabad', label: t.areaNorthNazimabad },
  ];
  const query = search.trim().toLocaleLowerCase();
  const visibleListings = supportListings.filter((listing) => {
    const matchesArea = area === 'all' || listing.area === area;
    const searchable = [listing.name, listing.kind, listing.kindUr, listing.area, listing.areaUr, listing.address, listing.addressUr, listing.description, listing.descriptionUr].join(' ').toLocaleLowerCase();
    return matchesArea && (!query || searchable.includes(query));
  });
  return <main className="content page-enter"><PageHeading eyebrow={t.nav.specialists} title={t.specialistsTitle} body={t.specialistsBody} /><Card className="directory-notice"><ShieldCheck size={20} /><p>{t.directoryNote}</p></Card><div className="directory-tools"><div className="search-box"><Search size={18} /><input data-testid="input-specialist-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} /></div><select data-testid="select-specialist-area" aria-label={t.allAreas} value={area} onChange={(e) => setArea(e.target.value)}><option value="all">{t.allAreas}</option>{areas.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div className="directory-summary"><span>{visibleListings.length} {t.results}</span>{(search || area !== 'all') && <button className="text-link" onClick={() => { setSearch(''); setArea('all'); }}>{lang === 'ur' ? 'فلٹر صاف کریں' : 'Clear filters'}</button>}</div>{visibleListings.length ? <div className="directory-grid">{visibleListings.map((listing) => <Card className="directory-card" key={listing.id}><div className="directory-card-top"><div className="directory-stamp small"><Compass size={21} /></div><span className="directory-area">{lang === 'ur' ? listing.areaUr : listing.area}</span></div><span className="eyebrow">{lang === 'ur' ? listing.kindUr : listing.kind}</span><h2 className="font-serif">{listing.name}</h2><p>{lang === 'ur' ? listing.descriptionUr : listing.description}</p><div className="directory-detail"><span><Info size={14} /><strong>{t.address}</strong>{lang === 'ur' ? listing.addressUr : listing.address}</span><span><Clock3 size={14} /><strong>{t.hours}</strong>{lang === 'ur' ? listing.hoursUr : listing.hours}</span></div><div className="directory-actions">{listing.phoneHref && <a className="pw-btn pw-btn-outline" href={listing.phoneHref}><PhoneIcon size={15} /> {t.callSupport}</a>}<a className="pw-btn pw-btn-quiet" href={listing.website} target="_blank" rel="noreferrer">{t.viewWebsite} <ArrowUpRight size={15} /></a></div><div className="directory-source"><ShieldCheck size={13} /> {t.officialSource} · {t.verify}</div></Card>)}</div> : <div className="directory-placeholder"><div className="directory-stamp"><Search size={27} /></div><span className="eyebrow">{t.placeholderTag}</span><h2 className="font-serif">{t.noSpecialists}</h2><p>{t.noSpecialistsBody}</p><strong><Info size={15} /> {t.verify}</strong></div>}</main>;
}

function SettingsPage({ settings, lang, onLanguage, onClear }: { settings: Settings; lang: Lang; onLanguage: (lang: Lang) => void; onClear: () => void }) {
  const t = copy[lang]; const [about, setAbout] = useState(false); const [notice, setNotice] = useState(false); const clear = () => { if (window.confirm(t.clearConfirm)) { onClear(); setNotice(true); setTimeout(() => setNotice(false), 2600); } };
  return <main className="content page-enter"><PageHeading eyebrow={t.nav.settings} title={t.settingsTitle} /><div className="settings-layout"><section className="settings-main"><Card className="setting-block"><div className="setting-icon"><span>文</span></div><div className="setting-copy"><h2>{t.language}</h2><p>{t.languageBody}</p></div><div className="language-switch"><button className={settings.language === 'en' ? 'selected' : ''} data-testid="button-settings-english" onClick={() => onLanguage('en')}>English</button><button className={settings.language === 'ur' ? 'selected' : ''} data-testid="button-settings-urdu" onClick={() => onLanguage('ur')}>اردو</button></div></Card><Card className="setting-block privacy-block"><div className="setting-icon"><LockKeyhole size={20} /></div><div className="setting-copy"><h2>{t.privacy}</h2><p>{t.privacyBody}</p><div className="privacy-list"><span><Check size={14} /> {lang === 'ur' ? 'صرف آپ کے براؤزر میں' : 'Only in your browser'}</span><span><Check size={14} /> {lang === 'ur' ? 'کوئی نیٹ ورک نہیں' : 'No network requests'}</span><span><Check size={14} /> {lang === 'ur' ? 'آپ کا مکمل اختیار' : 'You stay in control'}</span></div></div></Card><Card className="danger-block"><div><h2>{t.clearData}</h2><p>{t.clearDataHint}</p></div><Button variant="danger" data-testid="button-clear-data" onClick={clear}><Trash2 size={16} /> {t.clearData}</Button></Card>{notice && <div className="save-notice"><Check size={16} /> {t.cleared}</div>}</section><aside className="about-card"><div className="about-mark">PW</div><span className="eyebrow">{t.about}</span><h2 className="font-serif">{t.appName}</h2><p>{t.aboutBody}</p><div className="about-rule" /><small>{t.version}</small><button className="text-link" onClick={() => setAbout(!about)}>{about ? t.close : t.about} <ChevronDown size={15} className={about ? 'rotate' : ''} /></button>{about && <p className="about-extra">{lang === 'ur' ? 'یہ ایپ مقامی طور پر آپ کی عادات اور غور و فکر کے لیے بنائی گئی ہے۔' : 'Made for private reflection, gentle routines, and the days that need a little more room.'}</p>}</aside></div></main>;
}

function NotFoundPage({ lang, setLocation }: { lang: Lang; setLocation: (path: string) => void }) { const t = copy[lang]; return <main className="content error-page"><div className="error-symbol"><CircleHelp size={27} /></div><h1 className="font-serif">{t.errorTitle}</h1><p>{t.errorBody}</p><Button onClick={() => setLocation('/')}>{t.goHome} <ArrowRight size={16} /></Button></main>; }

function App() {
  const [location, setLocation] = useLocation();
  const [settings, setSettingsState] = useState<Settings>(() => {
    const stored = getStored<Partial<Settings>>(KEY.settings, {});
    const profile = getStored<Profile>(KEY.profile, { language: 'en', onboarded: false });
    return { language: stored.language ?? profile.language, onboarded: stored.onboarded ?? profile.onboarded };
  });
  const [journals, setJournals] = useState<JournalEntry[]>(() => getStored(KEY.journals, []));
  const [moodsLogs, setMoodsLogs] = useState<MoodLog[]>(() => getStored(KEY.moods, []));
  const [chats, setChats] = useState<ChatMessage[]>(() => getStored(KEY.chats, []));
  const [results, setResults] = useState<AssessmentResult[]>(() => getStored(KEY.results, []));
  const lang = settings.language; const t = copy[lang];
  useEffect(() => save(KEY.settings, settings), [settings]);
  useEffect(() => save(KEY.profile, settings), [settings]);
  useEffect(() => save(KEY.journals, journals), [journals]);
  useEffect(() => save(KEY.moods, moodsLogs), [moodsLogs]);
  useEffect(() => save(KEY.chats, chats), [chats]);
  useEffect(() => save(KEY.results, results), [results]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'; }, [lang]);
  const setSettings = (next: Settings) => setSettingsState(next);
  const onMood = (mood: Mood) => { const log = { id: uid(), createdAt: now(), mood }; setMoodsLogs((logs) => [...logs, log]); };
  const onClear = () => { Object.keys(localStorage).filter((key) => key.startsWith('psychwell_')).forEach((key) => localStorage.removeItem(key)); setSettingsState({ language: lang, onboarded: false }); setJournals([]); setMoodsLogs([]); setChats([]); setResults([]); setLocation('/'); };
  if (!settings.onboarded) return <Onboarding settings={settings} setSettings={setSettings} />;
  let page: ReactNode;
  if (location === '/') page = <HomePage lang={lang} moodsLogs={moodsLogs} journals={journals} onMood={onMood} setLocation={setLocation} />;
  else if (location === '/journal') page = <JournalPage lang={lang} journals={journals} onAdd={(entry) => { setJournals((all) => [...all, entry]); setMoodsLogs((all) => [...all, { id: entry.id, createdAt: entry.createdAt, mood: entry.mood }]); }} onDelete={(id) => setJournals((all) => all.filter((entry) => entry.id !== id))} />;
  else if (location === '/aria') page = <AriaPage lang={lang} chats={chats} onSend={(message) => setChats((all) => [...all, message])} onClear={() => setChats([])} />;
  else if (location === '/assessments') page = <AssessmentsPage lang={lang} results={results} onResult={(result) => setResults((all) => [...all, result])} />;
  else if (location === '/exercises' || location.startsWith('/exercises?')) page = <ExercisesPage lang={lang} />;
  else if (location === '/specialists') page = <SpecialistsPage lang={lang} />;
  else if (location === '/settings') page = <SettingsPage settings={settings} lang={lang} onLanguage={(language) => setSettingsState({ ...settings, language })} onClear={onClear} />;
  else page = <NotFoundPage lang={lang} setLocation={setLocation} />;
  return <Shell lang={lang} location={location.split('?')[0]} setLocation={setLocation}>{page}</Shell>;
}

export default App;