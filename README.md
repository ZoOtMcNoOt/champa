# Champa Valentine Site

Private Next.js scrapbook for Champa with:
- envelope-style lock screen
- secure password gate
- timeline gallery + cat blog
- one-time AI caption generation into static JSON

## 1) Setup

Create `.env.local`:

```env
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-random-secret
CHAMPA_PASSWORD_HASH=scrypt:your_salt:your_hash
```

Generate hash:

```bash
node scripts/make-password-hash.mjs champaisthebest
```

## 2) Install

```bash
npm install
```

## 3) Generate Data

```bash
npm run generate:manifest
npm run generate:captions
```

Captions are saved to `content/captions.generated.json` and used statically at runtime.

## 4) Run

```bash
npm run dev
```

## 5) E2E Test

```bash
npm run test:e2e
```
