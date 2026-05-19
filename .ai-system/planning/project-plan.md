# Project Plan

> **Overview:** This plan tracks the major product phases for CAS, from bootstrap to launch preparation. It is intentionally high-level so the task queue can hold the immediate work and this file can show the broader delivery map. Nothing here should be treated as complete until the corresponding runtime code exists. Update checkboxes as milestones land.

---

## Phase 0 — Architecture & Contracts

> **Section summary:** Lock the contracts before building UI or business logic. This phase reduces churn later by defining the integration surfaces early.

- [ ] Finalize CAS environment contract and required variables
- [ ] Confirm CIS identity mapping fields and platform link model
- [ ] Confirm report-sys attendance bridge payload contract
- [ ] Confirm SMS OTP provider and message templates
- [ ] Define Prisma schema for the core CAS entities

---

## Phase 1 — Foundation

> **Section summary:** Create the application skeleton and the common utilities that everything else depends on.

- [ ] Scaffold Next.js 15 App Router project structure
- [ ] Implement shared config validation and environment loading
- [ ] Add Prisma client, migration workflow, and database connection setup
- [ ] Build auth primitives for JWT cookies and session resolution
- [ ] Establish the glassy bento design tokens and global layout

---

## Phase 2 — Core Attendance Workflow

> **Section summary:** Deliver the cell leader experience that captures attendance and first-timers reliably.

- [ ] Implement OTP login and CIS user linking
- [ ] Build session lifecycle endpoints and attendance submission flow
- [ ] Add first-timer capture and roster management
- [ ] Create cell leader dashboard and attendance checklist UI
- [ ] Add submission review and WhatsApp share summary

---

## Phase 3 — Integration & Sync

> **Section summary:** Push clean attendance data into the rest of the Harvesters estate and keep local state in sync.

- [ ] Implement report-sys bridge endpoint for attendance ingestion
- [ ] Add event or queue-based sync for attendance submissions
- [ ] Add CIS-aware user and role reconciliation flows
- [ ] Build offline queue replay for poor connectivity
- [ ] Add audit logging for key submission and identity changes

---

## Phase 4 — Quality & Polish

> **Section summary:** Harden the product so it behaves well under real-world usage and future extension.

- [ ] Unit tests for auth, attendance, and sync services
- [ ] Integration tests for route handlers and Prisma transactions
- [ ] Accessibility audit for mobile and desktop flows
- [ ] Performance pass for dashboard and session submission paths
- [ ] Error and loading states across all critical screens

---

## Phase 5 — Launch Preparation

> **Section summary:** Prepare the app for production rollout and cross-team adoption.

- [ ] Production environment configuration reviewed
- [ ] Security review for cookies, tokens, uploads, and validation
- [ ] Deployment pipeline and monitoring checked
- [ ] Documentation and handoff notes complete
- [ ] Mobile Flutter contract reviewed for future reuse

---

## Completed

> **Section summary:** Keep only work that is fully shipped. Nothing product-facing has been completed yet in this repository.

- [x] AI system bootstrap and project guidance scaffolded
