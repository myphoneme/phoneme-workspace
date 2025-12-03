# Repository Guidelines

## Project Structure & Module Organization
- `client/` React + Vite + Tailwind TypeScript app; key folders: `src/api` (HTTP helpers), `src/components` (UI, layout), `src/contexts` (auth/provider state), `src/hooks` (TanStack Query hooks), `src/utils` (helpers), `public/` static assets.
- `server/` Express + SQLite API; `src/routes` (auth, users, settings, todos, comments, notifications, AI), `src/middleware`, `src/db.ts` (better-sqlite3 setup), `src/index.ts` (entry). SQLite lives in `server/database.sqlite`.
- Root docs: `README.md` (setup), `CLAUDE.md`; this guide: `AGENTS.md`.

## Build, Test, and Development Commands
- Client: `cd client && npm run dev` (Vite dev server on :5173), `npm run build` (type-check + bundle), `npm run preview` (serve build), `npm run lint` (ESLint flat config).
- Server: `cd server && npm run dev` (nodemon + tsx on :3001), `npm run build && npm start` (compile to `dist` and run). Ensure Node 20+.
- Run client and server in separate terminals; keep CORS origin aligned (`http://localhost:5173`).

## Coding Style & Naming Conventions
- TypeScript everywhere; keep strict types and favor explicit interfaces/types in `types.ts` files.
- React components PascalCase; hooks prefixed with `use` in `hooks/`; utilities camelCase. Prefer functional components and hooks over classes.
- Formatting: 2-space indent, semicolons, single quotes, trailing commas where valid. Tailwind utility classes for styling; co-locate component styles in `App.tsx`/`index.css` only when necessary.
- Lint before pushing (`npm run lint` in `client`). Match existing patterns when adding middleware/routes on the server.

## Testing Guidelines
- No automated suite yet; add tests alongside features. Suggested stack: Vitest + React Testing Library for client, supertest for Express handlers. Co-locate under `client/src/__tests__` or `server/src/__tests__`.
- Minimum manual pass before PR: auth/login, task CRUD, comments, admin toggles, and AI assistant overlay. Note regressions in the PR body.

## Commit & Pull Request Guidelines
- Use concise, imperative commits (e.g., `Add task filtering`, `Fix comment deletion`). Conventional prefixes (`feat:`, `fix:`, `chore:`) are welcome for clarity.
- PRs should describe the change, list key commands run (build/lint/tests), and include screenshots/GIFs for UI changes. Link related issues and call out breaking changes or new env vars.

## Security & Configuration Tips
- Keep secrets in environment variables (`PORT`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`); do not commit `.env` files. Regenerate tokens if exposed.
- SQLite file is local; avoid sharing production data. Update CORS origins if deploying beyond localhost.
