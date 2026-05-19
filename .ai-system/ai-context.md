# Project AI Context

> **Overview:** The Harvesters CRM workspace is currently a bootstrap repository for the Cell Attendance System AI operating guide. The codebase itself does not yet contain the application runtime; instead, it contains the `.ai-system` instruction set, project planning docs, and the session launcher used to start AI-assisted development. The target product described by the docs is a Next.js 15 PWA + API backend for cell attendance that integrates with CIS, report-sys, Redis, PostgreSQL, and SMS delivery. This file is the operational context most AI helpers should read first, and it stays aligned with the bootstrap docs under `.ai-system/`.

---

## Quick Reference

> **Section summary:** The repo is currently a documentation-first scaffold, not a finished application. The table below captures both the current repo shape and the intended product stack from the CAS roadmap.

| Field                 | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| Project Name          | Harvesters CRM / Cell Attendance System bootstrap      |
| Type                  | Documentation scaffold for a Next.js PWA + API backend |
| Primary Language      | TypeScript                                             |
| Frontend              | Next.js 15 App Router (planned)                        |
| Backend               | Next.js route handlers + service layer (planned)       |
| Database              | PostgreSQL via Prisma (planned)                        |
| Styling               | Tailwind CSS v4 + CSS custom properties                |
| Offline Layer         | IndexedDB (`idb`) + Workbox service worker             |
| External Integrations | CIS, report-sys, Redis, SMS provider, Cloudinary       |
| Deployment            | Vercel-style serverless web app target                 |

---

## Key Modules

> **Section summary:** The repository currently contains AI guidance modules rather than product modules. The product modules listed here are the target delivery areas described by the CAS roadmap and should be built in that order.

| Module           | Location                  | Purpose                                                                         |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------- |
| AI system docs   | `.ai-system/`             | Single source of development guidance, planning, memory, and architecture notes |
| Session launcher | `start-ai-dev.bat`        | Starts Ollama, codebase-mcp, and VS Code for AI-assisted work sessions          |
| App shell        | `app/`                    | Planned Next.js route tree for the PWA and API routes                           |
| Domain services  | `lib/`, `services/`       | Planned business logic for auth, attendance, CIS sync, and reporting bridges    |
| Data layer       | `prisma/`                 | Planned Prisma schema, migrations, and database access patterns                 |
| Offline support  | `public/`, `lib/offline/` | Planned service worker, IndexedDB queue, and sync replay logic                  |
| Design system    | `components/`, `styles/`  | Planned glassy bento UI, tokens, and reusable components                        |

---

## Agent Instructions Location

All AI agent documentation lives in `.ai-system/`.

Start with: `.ai-system/agents/general-instructions.md`

---

## Active Development Focus

The immediate focus is bootstrapping the actual CAS application skeleton around the documented stack: Next.js 15, Prisma, PostgreSQL, CIS integration, and the PWA offline layer. Until those source files exist, the `.ai-system` docs are the authoritative project brain and should be updated before major implementation work begins.
