<!-- Brief, actionable instructions for AI coding agents working on this repo -->
# Copilot / AI Agent Instructions
<!-- Copilot / AI Agent instructions for this repository -->
# Purpose
Concise, actionable guidance to make an AI coding agent productive in this repo. Focus on concrete patterns, build/debug commands, and places where small edits have wide impact.

## Quick start
- Dev server: `npm run dev` (Vite). Build: `npm run build`. Preview: `npm run preview` — see `package.json` scripts.
- Primary authoring tree: work in `src/` (prefer `src/*`). Root-level files (e.g., `App.tsx`, `services/geminiService.ts`, `lib/supabaseClient.ts`) are copies — edit them only if instructed.

## Big-picture architecture (what to know fast)
- Frontend: React + TypeScript + Vite. Entry points: `src/main.tsx` -> `src/App.tsx`.
- UI model: single-page app using internal tab state (see `activeTab` in `src/App.tsx`). Add pages as tabs or children of the main `Layout` instead of adding routes.
- Global state: uses React Context providers in `src/App.tsx` — `SettingsContext`, `ThemeContext`, `SidebarContext`, plus `ToastProvider`.
- Services: AI & integrations live in `src/services/` (primary: `geminiService.ts`) and clients in `src/lib/` (primary: `supabaseClient.ts`). AI code expects strict JSON responses from models.

## Key developer workflows
- Run locally: `npm ci` then `npm run dev` (Vite dev server).
- Build for production: `npm run build`; preview with `npm run preview`.
- Environment vars for client code: use `import.meta.env.VITE_*` (examples: `VITE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Add them to a local `.env` (do not commit secrets).

## Project-specific conventions & gotchas
- Dual-source trees: `src/` is canonical. Root duplicates exist for legacy or CI; changing root copies may be overwritten by sync scripts. When in doubt, update `src/`.
- AI integration: `src/services/geminiService.ts` uses `@google/genai` and constructs `responseSchema` objects; callers assume exact JSON keys. If you change the schema or prompt, update all callers (search for `categorizeTransaction`, `scanReceipt`, `generateQuote`, `analyzeRFQ`, `parseBulkServices`).
- Supabase client: `src/lib/supabaseClient.ts` uses `import.meta.env.VITE_SUPABASE_*` and falls back to placeholders to avoid build crashes. Keep the client small and pure for reuse across components.
- Navigation pattern: internal `activeTab` + optional `activeSubTab`. UI automation and tests should interact with tab state rather than routes.

## Files to inspect first (fast map)
- `src/App.tsx` — app wiring, providers, `activeTab` logic.
- `src/components/MainLayout.tsx` — header/sidebar, tab controls.
- `src/services/geminiService.ts` — AI prompts, strict `responseSchema`, model selection using local settings.
- `src/lib/supabaseClient.ts` — supabase client initialization and env var usage.
- `context/SettingsContext.tsx`, `context/ThemeContext.tsx`, `context/SidebarContext.tsx` — global settings and bootstrapping hooks.

## Editing guidance for AI agents (concrete rules)
1. Prefer editing `src/` files unless user explicitly wants root copies updated.
2. When changing an AI prompt or JSON schema in `src/services/geminiService.ts`:
	- Update the `responseSchema` and `systemInstruction` together.
	- Run a repo search for caller functions (e.g., `categorizeTransaction`, `scanReceipt`, `generateQuote`, `analyzeRFQ`) and adjust parsers.
3. When adding env vars: put them in a local `.env` and reference with `import.meta.env.VITE_*` in client code; use `process.env` only for server code.
4. Keep UI changes consistent with the tab model — adding a new top-level page should register a new tab in `MainLayout`.

## Helpful examples from the codebase
- Env access (preferred): `const apiKey = import.meta.env.VITE_API_KEY || '';` (`src/services/geminiService.ts`).
- Supabase fallback pattern: `const url = supabaseUrl || 'https://placeholder.supabase.co';` (`src/lib/supabaseClient.ts`).
- Tab-driven layout: `setActiveTab('dashboard')` and conditional rendering of children in `src/App.tsx`.

If anything is missing or you want a deeper mapping (call graph for AI outputs, tests around key components, or to sync root copies), tell me which area to expand.
