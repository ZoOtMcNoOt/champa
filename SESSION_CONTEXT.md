# Session Context (Handoff)

Last updated: 2026-02-13

## What Is Implemented
- Next.js 16 App Router site is fully scaffolded and functional.
- Password-locked envelope landing page implemented.
- Private routes implemented:
  - `/home`
  - `/timeline`
  - `/blog`
- Secure media route implemented:
  - `/api/media/[filename]`
- Server unlock endpoint implemented:
  - `POST /api/auth/unlock`
- Route protection implemented via `proxy.ts`.
- One-time captioning pipeline implemented and executed.

## Data Status
- Media manifest generated:
  - `content/media-manifest.json` -> 297 items
- Captions generated:
  - `content/captions.generated.json` -> 297 items
- Personalization set to:
  - `content/site-copy.ts` -> recipientName = `Emma`

## Verification Status
- Production build: PASS (`npm run build`)
- E2E test: PASS (`npm run test:e2e`)

## Important Files
- Lock UI:
  - `components/envelope-lock.tsx`
  - `components/envelope-lock.module.css`
- Private shell/nav:
  - `components/private-shell.tsx`
- Pages:
  - `app/page.tsx`
  - `app/(private)/home/page.tsx`
  - `app/(private)/timeline/page.tsx`
  - `app/(private)/blog/page.tsx`
- Auth/security:
  - `lib/auth.ts`
  - `lib/auth-edge.ts`
  - `app/api/auth/unlock/route.ts`
  - `proxy.ts`
- Media/caption loading:
  - `lib/media.ts`
  - `lib/captions.ts`
- Scripts:
  - `scripts/generate-manifest.mjs`
  - `scripts/generate-captions.mjs`
  - `scripts/make-password-hash.mjs`

## Env Vars Needed
- Required for secure password flow:
  - `SESSION_SECRET`
  - `CHAMPA_PASSWORD_HASH`
- Only needed if regenerating captions:
  - `OPENAI_API_KEY`

Current `.env.local` includes `OPENAI_API_KEY`.  
For production, set all required vars in Vercel.

## Commands To Resume Quickly
```bash
npm install
npm run build
npm run dev
```

If regenerating content:
```bash
npm run generate:manifest
node --env-file=.env.local scripts/generate-captions.mjs --detail low
```

If setting password hash:
```bash
node scripts/make-password-hash.mjs champaisthebest
```

## Open Tasks
- Fill `SESSION_SECRET` and `CHAMPA_PASSWORD_HASH` in `.env.local` + Vercel.
- Optional tone pass on generated captions in `content/captions.generated.json`.
- Final visual polish pass before sharing link.
- See `TODO.md` for the launch checklist.
