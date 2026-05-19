# Development Task Queue

> **Overview:** This queue holds the immediate next implementation steps for the CAS bootstrap. Pick tasks top to bottom and keep them small enough to finish in a single focused work session. When a task is completed, mark it done and add a checkpoint entry so the next agent can resume without rereading the whole repository.

---

## Current Sprint

> **Section summary:** These tasks should be tackled first because they establish the repo skeleton and the core integration boundaries.

- [ ] Scaffold the Next.js 15 application shell with App Router and base layout files
- [ ] Add Prisma schema, client setup, and migration-ready database configuration
- [ ] Implement environment validation for CIS, Redis, SMS, and PostgreSQL settings
- [ ] Build the CIS client wrapper and the initial auth route handlers
- [ ] Create the CAS design tokens and glassy bento dashboard shell

---

## Up Next

> **Section summary:** These tasks follow once the core scaffold is in place and the contracts are stable.

- [ ] Implement OTP request and verify flows with Redis-backed rate limiting
- [ ] Build the attendance session service and submission transaction
- [ ] Add offline queue storage with IndexedDB and a service worker
- [ ] Create the report-sys bridge endpoint for attendance sync

---

## Backlog

> **Section summary:** These items are important but can wait until the bootstrap and attendance MVP are stable.

- [ ] Add zonal leader dashboard and submission tracking views
- [ ] Add first-timer follow-up flows and task generation
- [ ] Add audit event logging and report history views
- [ ] Prepare Flutter-compatible API contract documentation

---

## Completed This Sprint

> **Section summary:** Completed work moves here during the sprint and is then summarized in dev-history.md at the end of the session.

- [x] AI system docs bootstrapped from the CAS roadmap and integration guides

---

## Notes

The repository currently has no application source tree, so the first sprint must create the actual runtime scaffold before any feature-level work can land. Keep the implementation aligned with the roadmap and do not invent a separate backend shape.
