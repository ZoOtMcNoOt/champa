# Champa Valentine TODO

## Before Sharing
- [ ] Review `content/captions.generated.json` and tweak any captions that feel off-tone.
- [ ] Confirm password flow with the real password on a clean browser session.
- [ ] Update any final personal message text in `content/site-copy.ts`.

## Security
- [ ] Generate password hash: `node scripts/make-password-hash.mjs champaisthebest`
- [ ] Set `SESSION_SECRET` (strong random value).
- [ ] Set `CHAMPA_PASSWORD_HASH` in `.env.local` and Vercel env vars.
- [ ] Remove `OPENAI_API_KEY` from production env if no more caption generation is needed.

## Deploy
- [ ] Run `npm run build` one last time locally.
- [ ] Deploy to Vercel.
- [ ] Set production/preview env vars in Vercel.
- [ ] Verify `/`, unlock animation, `/home`, `/timeline`, `/blog` on mobile + desktop.

## Nice-to-Have
- [ ] Add a custom favicon/photo for Champa.
- [ ] Add a small “favorite moments” section on home.
- [ ] Add one handwritten-style dedication note panel from Champa to Emma.
