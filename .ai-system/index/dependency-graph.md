# Dependency Graph

> **Overview:** The repository currently depends on its documentation and bootstrap harness. The planned application graph below shows how the CAS runtime should be layered once the app scaffold exists. Use this file to keep the module boundaries narrow and to avoid embedding business logic in route handlers or UI components. Updated whenever a new module or external service is introduced.

---

## Module Dependency Map

> **Section summary:** The current repo only has bootstrap dependencies. The planned product graph below is the one to follow when the runtime code is created.

```text
start-ai-dev.bat
  → Ollama
  → codebase-mcp
  → VS Code

.ai-system docs
  → project plan and task queue
  → architecture, design, context, repair notes

Planned CAS app
  app/ route handlers
    → domain services
    → auth services
    → attendance services
    → integration services
    → Prisma data access
    → PostgreSQL

  auth services
    → Redis OTP store
    → SMS provider
    → CIS client
    → JWT utilities

  attendance services
    → Prisma transactions
    → report-sys bridge
    → audit/event logging

  offline client layer
    → IndexedDB (`idb`)
    → Workbox service worker
    → sync replay endpoints
```

---

## External Dependencies

> **Section summary:** These packages and services are part of the target stack, even though the runtime code has not been installed yet. Review them before adding anything new.

| Package / Service | Purpose                                    | Used In                |
| ----------------- | ------------------------------------------ | ---------------------- |
| Next.js 15        | App Router, route handlers, server actions | Planned app shell      |
| React             | UI rendering and component composition     | Planned frontend       |
| Prisma            | ORM and migrations                         | Data layer             |
| PostgreSQL        | Main application data store                | Persistence            |
| `jose`            | JWT creation and verification              | Auth layer             |
| Redis             | OTP, rate limiting, transient sync state   | Auth and security      |
| `idb`             | IndexedDB wrapper for offline queues       | PWA offline layer      |
| Workbox           | Service worker and background sync         | PWA offline layer      |
| Tailwind CSS v4   | Utility-first styling                      | Design system          |
| CIS               | Identity and role federation               | Auth/integration layer |
| report-sys        | Attendance bridge consumer                 | Integration layer      |
| SMS provider      | OTP delivery                               | Auth flow              |

---

## Circular Dependency Warnings

> **Section summary:** No runtime circular dependencies exist yet because the application code has not been scaffolded. The first guardrail is to keep UI, services, and data access separated.

None detected yet.

---

## Dependency Rules

> **Section summary:** These rules prevent the eventual app from drifting into a tightly coupled shape. Follow them when the first source files are created.

- Route handlers may depend on services, not directly on raw database queries.
- Services may depend on data access modules, not on UI components.
- UI components may depend on typed view models, not on Prisma models directly.
- Integration adapters should isolate CIS and report-sys contract details from the rest of the app.
- Offline queue code must not reach into auth or database layers directly.
