# System Architecture

> **Overview:** The current repository is a documentation-first bootstrap workspace, so the only implemented runtime architecture is the AI development harness. The target application architecture described by the product docs is a federated Next.js 15 PWA + API backend for the Cell Attendance System. That backend is designed to integrate with CIS for identity, report-sys for attendance synchronization, PostgreSQL via Prisma for persistence, Redis for OTP and rate limiting, and a PWA offline stack built on IndexedDB and Workbox. The architecture below reflects the intended CAS delivery model and the actual repo state.

---

## Architecture Diagram

> **Section summary:** The repo currently contains only the bootstrap harness. The product architecture below is the planned CAS stack that the AI docs are preparing the repository to host.

```text
Developer session
    → start-ai-dev.bat
    → Ollama + codebase-mcp + VS Code
    → .ai-system docs and task queue
    → Next.js 15 App Router (planned app/)
         → Route handlers / server actions
         → Service layer (auth, sessions, attendance, sync)
         → Prisma data access layer
         → PostgreSQL
         → CIS / report-sys / SMS / Redis / Cloudinary

Browser / PWA client
    → UI components and design system
    → IndexedDB queue + Workbox service worker
    → API route handlers
```

---

## Module Breakdown

> **Section summary:** The module map separates the current bootstrap utilities from the planned product modules. Each module has one responsibility and should stay narrow.

| Module            | Responsibility                                        | Key Files                                               | Dependencies                          |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------- |
| AI system docs    | Development brain, planning, memory, and instructions | `.ai-context.md`, `.ai-system/**`                       | None                                  |
| Session launcher  | Starts the local AI development environment           | `start-ai-dev.bat`                                      | Ollama, codebase-mcp, VS Code         |
| App shell         | Next.js routing, layouts, and UI entrypoints          | `app/**` (planned)                                      | React, Next.js, design system         |
| Auth module       | OTP request/verify, JWT issuance, CIS linking         | `app/api/auth/**`, `lib/auth/**` (planned)              | Redis, CIS, SMS provider, jose        |
| Attendance module | Session lifecycle, roster capture, submission         | `app/api/v1/sessions/**`, `lib/attendance/**` (planned) | Prisma, PostgreSQL, report-sys bridge |
| Integration layer | Cross-system identity and reporting sync              | `lib/cis/**`, `lib/report-bridge/**` (planned)          | CIS, report-sys, webhooks             |
| Offline layer     | Local persistence and replay for poor connectivity    | `lib/offline/**`, `public/sw.js` (planned)              | idb, Workbox, Background Sync         |
| Data layer        | Schema, migrations, and database access               | `prisma/**` (planned)                                   | PostgreSQL                            |

---

## Data Flow

> **Section summary:** The main path is user action in the PWA, through route handlers and services, into Prisma-managed persistence, then out to the integrated estate. Auth and attendance both rely on that same service boundary.

### Standard Request Flow

```text
User action in PWA
    → route handler
    → domain service
    → Prisma query/transaction
    → PostgreSQL
    → optional integration event or bridge call
    → response to client
```

### Authentication Flow

```text
Phone number submitted
    → OTP generated and stored in Redis
    → SMS provider sends OTP
    → OTP verified
    → local CAS user resolved or created
    → CIS user linked or created
    → JWT pair issued in httpOnly cookies
    → client receives session
```

### Data Persistence Flow

```text
PWA form input
    → optional IndexedDB queue for offline capture
    → background sync or direct submit
    → service validates and normalizes data
    → Prisma writes in a transaction
    → audit and bridge events emitted as needed
```

---

## Configuration Points

> **Section summary:** The application is expected to stay config-driven. These values should come from environment variables or admin config rather than hardcoding.

| Config Key              | Purpose                                        | Location     | Default |
| ----------------------- | ---------------------------------------------- | ------------ | ------- |
| `DATABASE_URL`          | PostgreSQL connection string                   | `.env.local` | none    |
| `DIRECT_URL`            | Prisma direct connection for migrations        | `.env.local` | none    |
| `CIS_API_URL`           | Canonical Identity Service endpoint            | `.env.local` | none    |
| `CIS_API_KEY`           | CIS service authentication                     | `.env.local` | none    |
| `REDIS_URL`             | OTP, rate limiting, and short-lived sync state | `.env.local` | none    |
| `SMS_PROVIDER_KEY`      | OTP delivery credential                        | `.env.local` | none    |
| `NEXT_PUBLIC_APP_NAME`  | UI branding                                    | `.env.local` | `CAS`   |
| `NEXT_PUBLIC_APP_URL`   | Canonical app origin                           | `.env.local` | none    |
| `REPORT_SYS_BRIDGE_URL` | Attendance bridge endpoint                     | `.env.local` | none    |
| `CLOUDINARY_*`          | Media upload configuration                     | `.env.local` | none    |

---

## Tech Stack

> **Section summary:** This stack is taken from the CAS roadmap and is the target architecture for the application code that still needs to be scaffolded.

| Layer          | Technology                              | Version            |
| -------------- | --------------------------------------- | ------------------ |
| Frontend       | Next.js App Router + React              | Next.js 15         |
| Backend        | Next.js route handlers + server actions | Next.js 15         |
| Database       | PostgreSQL                              | Managed via Prisma |
| ORM            | Prisma                                  | Current target     |
| Auth           | JWT in httpOnly cookies (`jose`)        | Current target     |
| Cache / OTP    | Redis                                   | Current target     |
| Styling        | Tailwind CSS + CSS custom properties    | v4 target          |
| Offline / Sync | Workbox + IndexedDB (`idb`)             | Current target     |
| SMS            | Termii or Africa's Talking              | Current target     |

---

## Known Constraints & Technical Debt

> **Section summary:** The main constraint is that the repository has no application source tree yet. The remaining debt is largely delivery debt: contracts, schema, and integration code still need to be created.

- The repository currently lacks `app/`, `prisma/`, and runtime service modules.
- The bootstrap docs are the only authoritative project specification until source files exist.
- CIS and report-sys integration are hard dependencies, so their contracts must be finalized early.
- Offline capture must be resilient without making the app depend on a live connection.
- The design system is specified in the roadmap, but not yet implemented in code.

---

## Architecture History

> **Section summary:** The history starts with a documentation bootstrap and no runtime code. Future entries should capture when the app skeleton, auth flow, and integration paths are created.

| Date       | Change                                                  | Reason                                             |
| ---------- | ------------------------------------------------------- | -------------------------------------------------- |
| 2026-05-19 | Bootstrapped AI system docs and target CAS architecture | Establish the project brain before app scaffolding |
