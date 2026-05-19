# Repair System — Error Knowledge Base

> **Overview:** This file records the most likely failure patterns for the current CAS stack before the application code exists. It is intentionally seeded with stack-specific issues so future debugging starts from known traps rather than rediscovering them. Add concrete repo-specific failures here as soon as they are observed and fixed. Keep entries short, factual, and tied to the actual repair.

---

## How to Use This File

- Before debugging, search for a matching symptom or stack pattern.
- After fixing an issue, add a new entry with the exact cause and prevention.
- Prefer preventive patterns and validation checks over one-off fixes.

---

## Error Log

> **Section summary:** Each entry should explain the symptom, root cause, fix, and a prevention strategy. Keep the log chronological so the most recent patterns are easiest to find.

---

### [TEMPLATE — copy this for each new error]

```
## [Error Title / Short Description]

**Symptom:**
[What the developer or user sees — error message, broken behaviour, etc.]

**Root Cause:**
[The actual technical reason this happened]

**Fix Applied:**
[What change was made to resolve it]

**Prevention:**
[How to avoid this in future — pattern, lint rule, architecture change, etc.]

**Files Affected:**
[List of files that were changed]

**Date:** [YYYY-MM-DD]
```

---

## Known Error Patterns

> **Section summary:** These are the most relevant failure modes for the CAS target stack. Check them before assuming a new bug is unique.

### React / Next.js

**Hydration Mismatch**

- Symptom: `Hydration failed because the initial UI does not match what was rendered on the server`
- Cause: Browser-only logic running during server render
- Fix: Move browser access into `useEffect` or client-only components
- Prevention: Never read `window`, `localStorage`, or current time during SSR

**Unique Key Warning**

- Symptom: `Each child in a list should have a unique "key" prop`
- Cause: Rendering lists without stable identifiers
- Fix: Use persistent IDs from domain data
- Prevention: Do not use array indexes for dynamic lists

### Prisma / Database

**Schema Drift**

- Symptom: Migrations apply differently from the current schema file or generated client
- Cause: Schema edited without a matching migration or generated client refresh
- Fix: Reconcile the schema, regenerate the client, and re-run migrations in order
- Prevention: Make schema changes through a controlled migration workflow only

**Interactive Transaction Timeout**

- Symptom: Attendance submission or sync operations hang or roll back under load
- Cause: Long-running work inside a Prisma transaction
- Fix: Keep the transaction narrowly focused on persistence only
- Prevention: Move external API calls outside the transaction boundary

### Redis / OTP

**Stale OTP or Rate-Limit State**

- Symptom: Users cannot request or verify OTPs after a legitimate attempt window
- Cause: TTL misconfiguration or key reuse across sessions
- Fix: Align TTLs and include user-specific key namespaces
- Prevention: Keep OTP state short-lived and isolated per phone number

**Cursor / Scan Loop Issues**

- Symptom: Cache invalidation jobs never finish or repeatedly scan the same keys
- Cause: Assuming Redis scan cursors are always numeric or always string values
- Fix: Handle both cursor forms and use direct deletes for exact keys
- Prevention: Treat Redis scan cursor handling as a typed edge case

### Configuration / Environment

**Missing Environment Variable**

- Symptom: features silently fail or return `undefined`
- Cause: env var present locally but absent in deployment
- Fix: Validate required variables on startup
- Prevention: Keep a strict env schema and fail fast

**CIS Contract Mismatch**

- Symptom: users authenticate locally but fail to link or sync across platforms
- Cause: platform mapping or identity payload fields drift from CIS contract
- Fix: lock the contract and update both sides together
- Prevention: version identity payloads and document the contract in `.ai-system`

---

## Resolved Errors Archive

> **Section summary:** Move fully fixed, non-recurring errors here so the active log stays focused on current and likely issues.

[Entries move here when the underlying cause has been permanently fixed]
