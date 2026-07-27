# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor UI

## Current Goal

- Implement `04-project-dialogs.md`: editor home empty state, Create/Rename/Delete project dialogs, sidebar rename/delete actions, mock data only (no API calls or persistence).

## Completed

- `01-design-system.md` — shadcn/ui installed (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `lucide-react` installed, `lib/utils.ts` `cn()` helper added, dark-only theme tokens wired into `app/globals.css` and mapped to `context/ui-context.md` naming (`bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.).
- `02-editor-chrome.md` — `components/editor/editor-navbar.tsx` (fixed-height top navbar, left/center/right sections, sidebar toggle with `PanelLeftOpen`/`PanelLeftClose`), `components/editor/project-sidebar.tsx` (floating slide-in sidebar with `isOpen` prop, `Projects` header + close button, `My Projects`/`Shared` tabs with empty placeholders, full-width `New Project` button). Dialog pattern already satisfied by existing shadcn `Dialog` (`components/ui/dialog.tsx`), which uses the project's color tokens and supports title/description/footer — no new dialog built. Both new components pass `tsc --noEmit` and `eslint` with no errors.
- `03-auth.md` — `proxy.ts` protects all routes except the sign-in/sign-up paths (read from `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL`); `app/layout.tsx` wraps the app in `ClerkProvider` using `@clerk/ui/themes` `dark` theme with variables overridden to the project's CSS custom properties (no hardcoded colors); `app/sign-in` and `app/sign-up` use a shared `components/auth/auth-split-layout.tsx` two-panel layout (logo/tagline/feature list left, centered Clerk form right, form-only on small screens); `app/page.tsx` is now a server component redirecting authenticated users to `/editor` and unauthenticated users to `/sign-in`; `components/editor/editor-navbar.tsx` right section uses Clerk's `UserButton` directly (editor routes are already protected, so the signed-out branch was removed).
- `04-project-dialogs.md` — `lib/mock-projects.ts` (mock `Project[]` with `owner: "me" | "collaborator"`, `slugify()` helper); `hooks/use-project-dialogs.tsx` exports `ProjectDialogsProvider`/`useProjectDialogs()` context managing dialog type (`create`/`rename`/`delete`/`null`), active project, name/slug form state, and a mock `isLoading` (simulated 400ms delay, in-memory create/rename/delete — no API/persistence); `components/editor/project-dialogs.tsx` renders the three dialogs via the existing `components/ui/dialog.tsx`; `app/editor/page.tsx` is now the empty-state home (heading, description, `New Project` button, no cards) wired to `openCreateDialog`; `components/editor/project-sidebar.tsx` lists mock projects per tab, shows rename/delete icon-buttons only for `owner === "me"` items, and adds a `md:hidden` backdrop scrim that closes the sidebar on click/tap outside; `app/editor/layout.tsx` wraps navbar/sidebar/main in `ProjectDialogsProvider` and renders `<ProjectDialogs />`. `tsc --noEmit` and `eslint` both pass clean.

## In Progress

- None yet.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
