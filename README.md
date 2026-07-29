# System Architecture Builder

## Product Overview

System Architecture Builder is a real-time collaborative system design workspace. Users can design a system architecture by hand on a shared canvas, or describe it in plain English and let an AI agent map it out for them — either way, collaborators refine the architecture together, and the app converts the resulting graph into a persisted Markdown technical specification.

**Core flow:**

1. User signs in and creates or selects a project.
2. User optionally imports a prebuilt starter design (monolith, microservices, event-driven, serverless, etc.) into the canvas.
3. User builds out the system design manually by adding and connecting nodes on the canvas, and/or prompts an AI agent to generate or extend it.
4. If AI-assisted, the agent writes nodes and edges into the shared canvas as a durable background task.
5. Collaborators edit and refine the design together in real time.
6. User triggers spec generation, converting the graph into a Markdown technical spec.
7. The spec is persisted and available to view or download.

## Architecture Overview

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16 + TypeScript | Full-stack app with server/client boundaries |
| UI | Tailwind CSS + shadcn/ui | Component composition and styling |
| Auth | Clerk | User identity and route protection |
| Database | Prisma + PostgreSQL | Relational metadata: projects, collaborators, specs, task runs |
| Canvas | Liveblocks + React Flow (`@xyflow/react`) | Real-time collaborative canvas, presence, and cursors |
| Background tasks | Trigger.dev | Durable AI design and spec generation workflows |
| AI | Google Gemini (`@ai-sdk/google`) | Natural-language architecture and spec generation |
| Artifact storage | Vercel Blob | Canvas snapshots and generated Markdown specs |

### Key components

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, and persistence.
- `app/editor` — The collaborative canvas workspace UI.
- `trigger` — Long-running background jobs: AI design generation (`design-agent.ts`) and spec generation (`generate-spec.ts`).
- `lib` — Shared infrastructure: Prisma client, access control helpers, Liveblocks setup, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `prisma` — Database schema, migrations, and generated client output.

### Storage model

- **PostgreSQL** stores metadata: project ownership, collaborators, and task run records.
- **Vercel Blob** stores generated artifacts: canvas snapshots (`canvas/{projectId}.json`) and specs (`specs/{projectId}/{specId}.md`), referenced from the database by their blob URL.

## Installation

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Prisma Postgres](https://www.prisma.io/postgres))
- Accounts/API keys for [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), [Vercel Blob](https://vercel.com/storage/blob), [Trigger.dev](https://trigger.dev), and [Google AI (Gemini)](https://ai.google.dev)

### Steps

1. Clone the repository and install dependencies:

   ```bash
   git clone <repo-url>
   cd system_architecture_builder
   npm install
   ```

2. Create a `.env.local` file with the following variables:

   ```bash
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=

   # Prisma / PostgreSQL
   DATABASE_URL=

   # Liveblocks
   LIVEBLOCKS_PUBLIC_KEY=
   LIVEBLOCKS_SECRET_KEY=

   # Vercel Blob
   BLOB_READ_WRITE_TOKEN=

   # Trigger.dev
   TRIGGER_SECRET_KEY=

   # Google Gemini
   GOOGLE_AI_API_KEY=
   ```

3. Run database migrations and generate the Prisma client:

   ```bash
   npx prisma migrate dev
   ```

4. Start the Trigger.dev dev server (in a separate terminal) so background AI tasks can run locally:

   ```bash
   npx trigger.dev@latest dev
   ```

5. Start the Next.js dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployed App

> _Placeholder — add the production URL here once deployed._

[https://your-deployed-app-url.example.com](https://your-deployed-app-url.example.com)
