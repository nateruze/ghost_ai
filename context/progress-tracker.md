# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Data Layer

## Current Goal

- Add the next planned feature unit here.

## Completed

- `01-design-system.md` — shadcn/ui installed (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `lucide-react` installed, `lib/utils.ts` `cn()` helper added, dark-only theme tokens wired into `app/globals.css` and mapped to `context/ui-context.md` naming (`bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.).
- `02-editor-chrome.md` — `components/editor/editor-navbar.tsx` (fixed-height top navbar, left/center/right sections, sidebar toggle with `PanelLeftOpen`/`PanelLeftClose`), `components/editor/project-sidebar.tsx` (floating slide-in sidebar with `isOpen` prop, `Projects` header + close button, `My Projects`/`Shared` tabs with empty placeholders, full-width `New Project` button). Dialog pattern already satisfied by existing shadcn `Dialog` (`components/ui/dialog.tsx`), which uses the project's color tokens and supports title/description/footer — no new dialog built. Both new components pass `tsc --noEmit` and `eslint` with no errors.
- `03-auth.md` — `proxy.ts` protects all routes except the sign-in/sign-up paths (read from `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL`); `app/layout.tsx` wraps the app in `ClerkProvider` using `@clerk/ui/themes` `dark` theme with variables overridden to the project's CSS custom properties (no hardcoded colors); `app/sign-in` and `app/sign-up` use a shared `components/auth/auth-split-layout.tsx` two-panel layout (logo/tagline/feature list left, centered Clerk form right, form-only on small screens); `app/page.tsx` is now a server component redirecting authenticated users to `/editor` and unauthenticated users to `/sign-in`; `components/editor/editor-navbar.tsx` right section uses Clerk's `UserButton` directly (editor routes are already protected, so the signed-out branch was removed).
- `04-project-dialogs.md` — `lib/mock-projects.ts` (mock `Project[]` with `owner: "me" | "collaborator"`, `slugify()` helper); `hooks/use-project-dialogs.tsx` exports `ProjectDialogsProvider`/`useProjectDialogs()` context managing dialog type (`create`/`rename`/`delete`/`null`), active project, name/slug form state, and a mock `isLoading` (simulated 400ms delay, in-memory create/rename/delete — no API/persistence); `components/editor/project-dialogs.tsx` renders the three dialogs via the existing `components/ui/dialog.tsx`; `app/editor/page.tsx` is now the empty-state home (heading, description, `New Project` button, no cards) wired to `openCreateDialog`; `components/editor/project-sidebar.tsx` lists mock projects per tab, shows rename/delete icon-buttons only for `owner === "me"` items, and adds a `md:hidden` backdrop scrim that closes the sidebar on click/tap outside; `app/editor/layout.tsx` wraps navbar/sidebar/main in `ProjectDialogsProvider` and renders `<ProjectDialogs />`. `tsc --noEmit` and `eslint` both pass clean.
- `05-prisma.md` — `prisma/models/project.prisma` adds `Project` (`ownerId`, `name`, `description?`, `status: ProjectStatus` enum `DRAFT`/`ARCHIVED` default `DRAFT`, `canvasJsonPath?`, timestamps, `@@index([ownerId])`, `@@index([createdAt])`) and `ProjectCollaborator` (`projectId` with `onDelete: Cascade`, `email`, `createdAt`, `@@unique([projectId, email])`, `@@index([email])`, `@@index([projectId, createdAt])`); multi-file schema works via the existing `schema: "prisma/"` setting in `prisma.config.ts`. `lib/prisma.ts` is a cached singleton on `global` (dev-only) that branches on `DATABASE_URL`: `prisma+postgres://` uses `accelerateUrl` + `@prisma/extension-accelerate`, otherwise a direct `@prisma/adapter-pg` `PrismaPg` adapter. Installed missing runtime deps `@prisma/client`, `@prisma/adapter-pg`, `pg`, `@prisma/extension-accelerate` (spec said these were already installed; they weren't in `package.json`). Migration `prisma/migrations/20260727112612_init_project_models` applied and client generated to `app/generated/prisma` (already gitignored). `tsc --noEmit`, `eslint`, and `npm run build` all pass clean.

## In Progress

- None yet.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- `prisma.config.ts` now also reads `shadowDatabaseUrl` from `SHADOW_DATABASE_URL` (was previously unset). Needed to get `prisma migrate dev`/shadow-DB diffing working at all against the local `prisma dev` server.

## Session Notes

- Local Prisma Postgres dev server: `.env`'s `DATABASE_URL` points at `prisma+postgres://localhost:51213/...`, which requires `npx prisma dev` to be running (started it in the background this session — PID may not survive session end, restart with `npx prisma dev` if `DATABASE_URL` can't connect).
- `npx prisma migrate dev` itself reliably fails against this local dev server with `P1017 Server has closed the connection` (both against the local proxy URL and the raw `postgres://localhost:51214` URL it prints), even though plain `pg` queries and `prisma db push`/`prisma migrate diff`/`prisma migrate deploy` all work fine against the same URLs. Worked around it by generating the SQL with `prisma migrate diff --from-empty --to-schema prisma/ --script`, hand-placing it in a timestamped `prisma/migrations/<ts>_init_project_models/migration.sql`, and applying with `prisma migrate deploy` (which records it normally in `_prisma_migrations`). `prisma migrate status` confirms the schema is up to date. Future migrations should try `migrate dev` first — this may be an environment/version-specific quirk — and fall back to the diff+deploy approach if it recurs.
