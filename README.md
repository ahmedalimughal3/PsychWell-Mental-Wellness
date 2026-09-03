# PsychWell

PsychWell is a privacy-first, browser-only mental wellness companion for people in Pakistan.

## What it includes

- English and Urdu support with RTL layout
- Local mood check-ins and journaling
- Offline Dr. Aria reflection companion
- Six self-screening questionnaires
- Guided wellness exercises
- Karachi specialist-directory placeholder
- Local-only settings and complete data wipe

PsychWell does not require an account, backend, database, analytics, camera, or microphone. Personal entries and chat history stay in the browser's local storage.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/psychwell run dev
```

## Vercel

For Vercel, set the project root to `artifacts/psychwell`. The included `vercel.json` uses:

- Build command: `pnpm run build`
- Output directory: `dist/public`
