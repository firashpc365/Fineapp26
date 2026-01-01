<!-- Brief, actionable instructions for AI coding agents working on this repo -->
# Copilot / AI Agent Instructions

This file contains focused, discoverable knowledge to make an AI agent productive immediately in this codebase.

**Quick start**
- Build / dev: `npm run dev` (uses Vite). Build: `npm run build`. Preview: `npm run preview` — see `package.json`.
- Primary source for active development: `src/` (prefer `src/*`). There are parallel files at the repository root (e.g. `App.tsx`, `services/geminiService.ts`, `lib/supabaseClient.ts`) — these appear to be an older/migrated copy. Prefer `src/` variants unless asked otherwise.

**Big-picture architecture**
- Frontend: React + TypeScript + Vite. Entry points: `src/main.tsx` and `src/App.tsx` (also a root `App.tsx` copy).
- UI pattern: single-page app using internal tab state (see `src/App.tsx` / `App.tsx`) rather than route-first navigation. Layout components: `components/Layout.tsx` and `src/components/MainLayout.tsx`.
- State: Context providers wrap the app: `context/SettingsContext.tsx`, `context/ThemeContext.tsx`, `context/SidebarContext.tsx`. Use these for global settings, theme, sidebar state and bootstrapping.
- Services: backend/3rd-party integrations live in `services/` and `src/services/` — especially `geminiService.ts` (AI features) and `supabaseClient.ts` (database/auth).

**Key integration & env var patterns**
- Vite env vars: in `src/*` files use `import.meta.env.VITE_*` (e.g. `VITE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Node / server style: root `services/*` uses `process.env.*` (e.g. `API_KEY`, `NEXT_PUBLIC_SUPABASE_*`) — this indicates mixed runtime expectations. When changing runtime behavior, match the file you edit (client files → `import.meta.env`, server files → `process.env`).
- Supabase: client created in `src/lib/supabaseClient.ts` (preferred for Vite). Falls back to placeholders when env vars are missing — safe to run in demo mode.
- Gemini / AI: `src/services/geminiService.ts` calls `@google/genai` and expects `VITE_API_KEY`. It emits structured JSON via the model and uses strict responseSchema config — be careful when changing prompt/response formats.

**Project-specific conventions & patterns**
- Dual-source trees: There are duplicate files in root and in `src/`. Follow `src/` for Vite-based development; update root copies only if you know the repository intends to keep both.
- Navigation: The app uses an internal tab/subtab approach (see `activeTab` in `App.tsx`) instead of URL route changes. Tests or UI automation should trigger tab state rather than relying on routes.
- Context-first composition: Global providers are in `App` wrapper. When adding features that need settings/theme/sidebar, register the provider or use existing contexts: `useSettings()`, `useToast()`, etc.
- AI services return strict JSON shapes (see `services/geminiService.ts`). Code consuming these results assumes exact property names and types — avoid changing response keys without updating callers.

**Files to inspect when debugging or adding features**
- `src/App.tsx` and `App.tsx` — app wiring and tab logic
- `src/components/MainLayout.tsx` and `components/Layout.tsx` — navigation & layout
- `src/services/geminiService.ts` — AI prompts, response schemas, model selection
- `src/lib/supabaseClient.ts` — env var usage and client creation
- `context/SettingsContext.tsx`, `context/ThemeContext.tsx`, `context/SidebarContext.tsx` — global state
- `hooks/useAsyncAction.ts` and `hooks/useRealtime.ts` — common async/realtime patterns

**Editing guidance for AI agents**
- Prefer `src/` files for edits unless the user asks to modify the root copies.
- When changing an AI prompt or response schema in `src/services/geminiService.ts`, update both the schema and any callers that parse the model output (search for `categorizeTransaction`, `scanReceipt`, `generateQuote`, `analyzeRFQ`).
- When adding env vars, add them to local `.env` (not committed) and reference via `import.meta.env.VITE_*`. For server runtime code (if any), use `process.env`.
- Avoid breaking the tab-based navigation model: new pages should integrate as tabs or as children of `Layout` unless the user requests router migration.

If something here is unclear or you want me to expand a section (e.g., map callers of a specific AI output or create a small integration test), tell me which area to dig into next.
