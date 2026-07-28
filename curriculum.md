# Ghost AI — Learning Curriculum

Personal learning log. Not read by the app — just for tracking what I've built and the concepts behind it. Add to this as the project grows.

_Last updated: 2026-07-27_

---

## 1. Features Built So Far

### Authentication (Clerk)
Sign-up/sign-in is handled by **Clerk**, a third-party auth provider, rather than rolling our own login system.

- `proxy.ts` (root) — runs before every request and decides whether the visitor needs to be logged in. In older Next.js this file was called `middleware.ts`; this project's Next.js version renamed the convention to `proxy.ts` (see `AGENTS.md` — training data on Next.js may be stale for this repo).
- `app/layout.tsx` wraps the whole app in `<ClerkProvider>` so any component can ask "who is logged in?"
- `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` render Clerk's prebuilt forms.
- `app/page.tsx` checks auth state and redirects to `/editor` (logged in) or `/sign-in` (not).

**Why this architecture:** Auth is security-critical and easy to get subtly wrong (password storage, session tokens, email verification, etc.). Outsourcing it to Clerk trades a bit of vendor lock-in for a much smaller attack surface and far less code to maintain.

### Database & Data Model (Prisma + PostgreSQL)
- `prisma/schema.prisma` + `prisma/models/project.prisma` define two models: **`Project`** (id, ownerId, name, description, status, canvasJsonPath, timestamps) and **`ProjectCollaborator`** (id, projectId, email, timestamps), linked by a one-to-many relation with cascading delete.
- `ownerId` on `Project` is just a plain string (Clerk's user id) — there's no local `User` table, because Clerk already owns user identity. This is a deliberate boundary: **auth data lives in Clerk, app data lives in our own Postgres.**
- `lib/prisma.ts` creates a single shared Prisma Client instance (a "singleton") so the app doesn't open a new database connection on every request.

**Why this architecture:** Prisma gives type-safe database queries (TypeScript will complain at compile time if you misspell a field), and keeping a single client instance avoids exhausting the database's connection pool during local development hot-reloads.

### CRUD API for Projects
- `app/api/projects/route.ts` — `GET` lists the current user's projects, `POST` creates one.
- `app/api/projects/[projectId]/route.ts` — `PATCH` renames a project, `DELETE` removes it. Both check that the requester actually owns the project before acting (403 if not, 404 if it doesn't exist).
- `lib/projects.ts` — read-only helper functions (`getOwnedProjects`, `getSharedProjects`) used directly on the server, bypassing the API layer entirely.

**Why this architecture:** This is a **REST-ish** pattern — one file per resource, HTTP verbs mapped to CRUD (Create/Read/Update/Delete) operations. Ownership checks live in every mutating route rather than being assumed, so a user can never edit someone else's project even if they guess the URL.

### Project Dialogs (Create / Rename / Delete UI)
- `hooks/use-project-actions.tsx` — a React **Context** that holds shared state (which dialog is open, form values, loading/error flags) and the `fetch` calls to the API routes above.
- `components/editor/project-dialogs.tsx` — the actual dialog/modal UI, built from shadcn-style primitives (`components/ui/dialog.tsx`).
- Trigger buttons (`new-project-button.tsx`, buttons inside `project-sidebar.tsx`) just call functions from the context — they don't know anything about `fetch` or API URLs.

**Why this architecture:** This separates **state/logic** (the hook) from **presentation** (the dialog components) from **triggers** (the buttons). Any part of the UI can open "rename project" without duplicating the fetch/loading/error logic.

---

## 2. Glossary

| Term | Simple explanation | Technical explanation |
|---|---|---|
| **App Router** | Next.js's system where folders under `app/` become URL routes. | Next.js's file-system-based router where `app/<segment>/page.tsx` maps to a route, `layout.tsx` wraps nested routes, and `route.ts` defines an API endpoint for that path. |
| **Middleware / Proxy** | Code that runs before a page loads, to check things like "is this person logged in?" | A server-side request interceptor that runs before requests reach a route handler or page. In this Next.js version the file is `proxy.ts` instead of the classic `middleware.ts`. |
| **Server Component** | A React component that renders on the server and sends finished HTML to the browser — no extra JS for that part. | The App Router's default component type; runs only on the server, can directly access databases/secrets, and ships zero client-side JavaScript unless explicitly opted into. |
| **Client Component** | A React component that runs in the browser so it can respond to clicks, typing, etc. | A component marked `"use client"` at the top of the file; hydrated in the browser so it can use React state, effects, and browser APIs. |
| **ORM (Prisma)** | A tool that lets you talk to your database using normal code instead of writing raw SQL. | Object-Relational Mapper — Prisma generates a type-safe client from `schema.prisma`, translating method calls (`prisma.project.findMany()`) into SQL queries against Postgres. |
| **Schema / Model** | The blueprint describing what data looks like (e.g. a "Project" has a name and owner). | A `model` block in `schema.prisma` that defines a database table's columns, types, defaults, and relations, from which Prisma generates TypeScript types and migration SQL. |
| **Migration** | A saved, versioned change to the database's structure. | A generated SQL file (`prisma/migrations/.../migration.sql`) that alters the database schema in a repeatable, trackable way, letting the team and production stay in sync. |
| **Relation (1-to-many, cascade delete)** | Linking two kinds of data together — one Project can have many Collaborators. | A foreign key (`projectId` on `ProjectCollaborator`) referencing another model's primary key; `onDelete: Cascade` means deleting the parent row automatically deletes its children. |
| **CRUD** | The four basic things you do to data: Create, Read, Update, Delete. | The four core persistence operations, conventionally mapped to HTTP verbs `POST`, `GET`, `PATCH`/`PUT`, `DELETE` in REST APIs. |
| **REST route handler** | A file that defines what happens when the app receives a GET/POST/etc. request at a URL. | In the App Router, a `route.ts` file exporting functions named after HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`), each receiving the `Request` and returning a `Response`. |
| **Authentication vs. Authorization** | Authentication = proving who you are (logging in). Authorization = checking what you're allowed to do (is this your project?). | Authentication is identity verification (handled by Clerk via session tokens). Authorization is a per-request business-logic check — e.g. `if (project.ownerId !== userId) return 403` in the route handlers. |
| **React Context** | A way to share data (like "which dialog is open") between components without passing it through every layer manually. | A React API (`createContext`/`useContext`) for dependency injection across a component tree, avoiding prop-drilling; used here (`use-project-actions.tsx`) to centralize dialog + form state. |
| **Singleton (Prisma Client)** | Making sure there's only ever one "connection manager" to the database, not a new one every time. | A module-level cached instance (stored on `global` in dev) that prevents Next.js's hot-reload from spawning a new `PrismaClient` — and thus a new connection pool — on every file change. |
| **shadcn/ui** | A component library where you copy the component's code into your project instead of installing it as a black box. | A CLI-driven, code-ownership-first UI toolkit; here configured with the "base-nova" style, which is built on **Base UI** primitives rather than the more commonly documented Radix UI. |
| **Environment variables (.env)** | Secret or environment-specific settings (like database passwords) kept out of the actual code. | Key-value pairs loaded from `.env`/`.env.local` at build/runtime, used for secrets (`CLERK_SECRET_KEY`, `DATABASE_URL`) and public config (`NEXT_PUBLIC_*` vars, which get inlined into client JS bundles — so anything prefixed `NEXT_PUBLIC_` is not actually secret). |

---

## 3. Notes for Future Additions

Add new sections here as features are built — one "Feature" entry (what + why) and glossary rows for any new concept introduced. Keep entries dated so this doubles as a timeline of what was learned when.
