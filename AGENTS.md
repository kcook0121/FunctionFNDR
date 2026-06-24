# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Next.js 16** app (App Router, Turbopack, React 19, Tailwind v4) — a mobile-style nightlife product called "FunctionFNDR — HPU Nightlife". There is no separate backend; the only server code is the Next.js API route at `app/api/wallet/route.ts`. Supabase is used only to optionally load live events in `components/ticket-gate.tsx`; when the query fails it gracefully falls back to hard-coded placeholder events, so a real Supabase project is not required to run or test the app.

- **Package manager:** use `pnpm` (the lockfile in use is `pnpm-lock.yaml`, and `package.json` has a `pnpm.overrides` block). A `package-lock.json` also exists but is not the source of truth.
- **Required env vars:** `lib/supabaseClient.ts` throws at import time if `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset, which would crash the app. A `.env.local` with placeholder values is enough for everything to run (the Supabase call fails gracefully). The update script creates this file if it is missing; `.env.local` is gitignored, so do not expect it in a fresh checkout.
- **Run (dev):** `pnpm dev` serves on `http://localhost:3000`.
- **Build:** `pnpm build` (Next prod build; note `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`, so type errors won't fail the build).
- **Lint:** `pnpm lint` runs `eslint .`, but **eslint is not a declared dependency and there is no eslint config in the repo**, so this currently fails with `eslint: not found`. This is a pre-existing repo gap, not an environment problem.
- **Core hello-world flow to verify the app:** open the app → bottom nav "Tickets" tab → "RSVP NOW" on an event → "Pay with Apple Pay" → "Simulate Pay" → confirmed ticket voucher with a QR code. This exercises the main ticketing path.
