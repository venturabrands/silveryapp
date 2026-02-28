# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code-snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information. We are using specific skill for that fetch-docs

## Plans

At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.

## Commands

```bash
# Development (runs via Alchemy/Cloudflare)
npm run dev              # Start dev server with --profile ventura flag

# Build
npm run build            # Production build
npm run build:dev        # Development mode build

# Linting & Formatting (Rust-based tools, not ESLint/Prettier)
npm run lint             # Run oxlint
npm run lint:fix         # Run oxlint with auto-fix
npm run fmt              # Run oxfmt formatter
npm run fmt:check        # Check formatting without writing

# Testing
npm run test             # Run vitest once
npm run test:watch       # Run vitest in watch mode
```

To run a single test file: `npx vitest run src/path/to/test.ts`

## Architecture

**Silvery Sleep Expert** is an AI-powered sleep coaching PWA. It uses React + Vite on the frontend, Supabase for the database/edge functions, and Cloudflare Workers (via Alchemy) for backend workers.

### Stack at a glance

- **UI**: React 18 + TypeScript, shadcn/ui (Radix UI primitives), Tailwind CSS
- **Routing**: React Router v6 — routes defined in `src/App.tsx`
- **Server state**: TanStack React Query v5
- **AI chat**: Vercel AI SDK (`useChat` hook in `src/pages/SleepChat.tsx`) → Supabase Edge Function (`supabase/functions/sleep-chat/index.ts`) → Google Gemini Flash
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions) + Cloudflare D1 (SQLite via Drizzle ORM in `server/`)
- **Mobile**: Capacitor 8 wrapping the PWA for iOS/Android

### Key directories

- `src/pages/` — One file per route (Index, SleepChat, Privacy, Terms, Disclaimer, NotFound)
- `src/components/ui/` — shadcn/ui components (do not edit these directly; regenerate via shadcn CLI or edit carefully)
- `src/integrations/supabase/` — Supabase client (`client.ts`) and auto-generated DB types (`types.ts`)
- `server/` — Cloudflare Worker entrypoint (`worker.ts`) and Drizzle ORM schema/migrations (`db/`)
- `supabase/functions/` — Deno-based edge functions deployed to Supabase

### Data flow

1. Frontend pages call `supabase.from(table)...` directly for DB reads/writes (no auth required — auth was removed)
2. AI chat goes through `fetch(${VITE_SUPABASE_URL}/functions/v1/sleep-chat)` which streams responses via `text/event-stream`
3. The Cloudflare Worker (`server/worker.ts`) has its own D1 SQLite database (chats/messages schema in `server/db/schema.ts`) separate from Supabase's PostgreSQL
4. Analytics events are tracked via `src/lib/analytics.ts` → Supabase

### Styling conventions

- Tailwind utility classes throughout; path alias `@` maps to `src/`
- Dark theme by default; CSS variables defined in `src/index.css` using HSL format
- Fonts: DM Sans (body), Playfair Display (headings/serif)
- The `cn()` utility from `src/lib/utils.ts` merges Tailwind classes (clsx + tailwind-merge)

### Environment variables

All prefixed with `VITE_` for frontend access:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `VITE_SUPABASE_PROJECT_ID` — Project ID

### Deployment

The dev server runs through Alchemy (`npm run dev` uses `alchemy dev --profile ventura`). The app targets Cloudflare for worker deployment and Supabase for edge functions. PWA assets are in `public/` and handled by `vite-plugin-pwa`.
