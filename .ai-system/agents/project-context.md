# Project Context

> **Overview:** CAS is a Harvesters International Christian Centre web product for recording cell attendance, first-timer data, and session submissions. It is designed as a federated module in the wider digital estate, not a standalone identity or reporting system. The product must integrate cleanly with CIS for identity, report-sys for attendance consumption, and the existing Harvesters stack for authentication and notifications. This context file explains the business goal, constraints, and the decisions that shape the implementation.

---

## Project Purpose

> **Section summary:** CAS replaces the manual WhatsApp-to-spreadsheet attendance workflow with a structured, verified, mobile-friendly system. The goal is faster reporting, better data quality, and a stable bridge into the reporting ecosystem.

CAS exists to let cell leaders record attendance in minutes, not hours, while preserving accurate member-level history for the church. It should reduce manual collation, support offline or poor-network environments, and push clean data into the Reporting System without re-entry.

---

## Target Users

> **Section summary:** The system serves a small set of role-based users with different views of the same data. The interface and workflows should be tailored to those roles rather than to generic admin tooling.

| User Type       | Needs                                                          | Key Interactions                                   |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| Cell Leader     | Fast attendance capture, first-timer entry, session submission | Mobile-first attendance checklist, quick-add forms |
| Zonal Leader    | Zone visibility, submission tracking, reminder workflows       | Zone dashboard, approval/review screens            |
| District Leader | Cross-zone visibility and trend analysis                       | Summary dashboards and filters                     |
| Central Admin   | Org-wide oversight, configuration, and user management         | Web dashboards, config tables, audit views         |
| Data Entry      | Legacy support for manual capture when needed                  | Form-based submission screens                      |

---

## Business Constraints

> **Section summary:** These are the non-negotiable product rules that should keep the implementation aligned with the roadmap and the rest of the Harvesters estate.

- Must work well on mobile browsers and tolerate weak or intermittent network access.
- Must integrate with CIS instead of inventing a new identity source.
- Must remain migration-safe and avoid destructive changes to external systems.
- Must support offline queueing and later sync for attendance submissions.
- Must preserve an audit trail for attendance, sessions, and identity mapping.
- Must remain compatible with a future Flutter client without rewriting the API contract.

---

## Current Project Phase

> **Section summary:** The repository is in Phase 0 bootstrap mode. The docs are ready; the application scaffold still needs to be created.

Phase: Planning

Active sprint focus: Finalize the CAS application skeleton, environment contract, and initial integration boundaries before building the attendance flow.

---

## Tech Decisions Already Made

> **Section summary:** These decisions come directly from the product roadmap and should be treated as fixed unless the architecture changes intentionally.

| Decision                                | Reason                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| Next.js 15 App Router                   | Matches the Harvesters PWA estate and supports both PWA and API routes in one repo |
| Prisma + PostgreSQL                     | Shared persistence pattern across the estate and strong migration support          |
| JWT in httpOnly cookies                 | Standard auth pattern for the Harvesters web PWAs                                  |
| CIS as identity source                  | Prevents identity drift across platforms                                           |
| Redis for OTP and rate limiting         | Short-lived credential storage and abuse control                                   |
| Tailwind CSS v4 + CSS custom properties | Fast implementation with a tokenised design system                                 |
| Workbox + IndexedDB                     | Offline-first attendance capture and replay                                        |
| SMS OTP login                           | Best fit for cell leaders and mobile-first usage                                   |

---

## Out of Scope

> **Section summary:** These items are intentionally not part of the current delivery scope. They may exist in future phases, but they should not be built into the initial bootstrap.

- Replacing CIS or duplicating its identity responsibilities.
- Building the Flutter companion app in the current phase.
- Rewriting report-sys or MyHarvestHub.
- Making destructive migrations to external systems.
- Adding feature breadth before the auth, session, and attendance contracts are stable.

---

## External Integrations

> **Section summary:** These systems are the main integration dependencies for CAS. Their contracts and credentials should be treated as first-class project inputs.

| Service                                   | Purpose                                                    | Auth Method                  |
| ----------------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| Canonical Identity Service (CIS)          | Canonical user linking and cross-platform identity         | API key / bearer token       |
| report-sys                                | Attendance bridge target and downstream analytics consumer | Service token / internal API |
| Redis                                     | OTP storage, rate limiting, and short-lived coordination   | connection string / secret   |
| SMS provider (Termii or Africa's Talking) | OTP delivery to cell leaders                               | API key                      |
| Cloudinary                                | Media uploads for screenshots and attachments              | cloud credentials            |
| Prisma/PostgreSQL                         | Primary application persistence                            | connection string            |
