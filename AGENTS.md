# AGENTS.md

## Cursor Cloud specific instructions

FunctionFNDR is a single Next.js 16 (App Router, Turbopack, React 19) mobile-web app. There is only one service to run.

- Package manager is **pnpm** (despite a `package-lock.json` also being present). The update script runs `pnpm install`.
- Run the dev server with `pnpm dev` (serves the entire product on `http://localhost:3000`). Build with `pnpm build`, prod start with `pnpm start`. Scripts live in `package.json`.
- `pnpm lint` is currently broken: the `lint` script calls `eslint .` but `eslint` is not a dependency and there is no eslint config in the repo. Don't rely on it unless eslint is added.
- There are no automated tests configured (no Jest/Vitest/Playwright, no `test` script). Verify changes via `pnpm build` and manual GUI testing.
- `.env.local` ships with Supabase placeholder values. `lib/supabaseClient.ts` throws if `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset, so keep those vars present. Supabase is optional — the Ticket Gate falls back to hardcoded mock events (`lib/data.ts`) when Supabase is unreachable. No DB/Docker needed for development.
- The only backend route is `app/api/wallet/route.ts`, which returns a mock Apple Wallet `.pkpass` JSON voucher.
