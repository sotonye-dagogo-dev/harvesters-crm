# Development Task Queue

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: re-verify before each session

> **Overview:** Sprint-level task queue with complexity tagging. Agents execute tasks top to bottom within the current sprint. Each task is sized so it can be completed in a single session.

---

## Complexity Tags

Tags help agents self-select whether a task needs the full `execute-feature.md` pipeline or a lighter `dev-cycle.md`:

| Tag | Meaning | Recommended Command |
|-----|---------|-------------------|
| `[XS]` | Trivial — single file, known pattern | dev-cycle.md |
| `[S]` | Small — 1-3 files, well-understood | dev-cycle.md |
| `[M]` | Medium — 3-8 files, some planning needed | dev-cycle.md with plan-feature pre-read |
| `[L]` | Large — feature spanning modules | execute-feature.md |
| `[XL]` | Very large — architecture-affecting | execute-feature.md, requires architect role |
| `[BUG]` | Bug fix | fix-build.md |

---

## Current Sprint

| Size | Task | Status |
|------|------|--------|
| [S] | Confirm stack choices for backend, frontend, and database | [ ] |
| [M] | Create initial source folder structure and baseline configs | [ ] |
| [S] | Add first implementation milestone to project-plan.md | [ ] |

---

## Up Next

| Size | Task |
|------|------|
| [M] | Implement authentication module skeleton |
| [M] | Define customer entity model and validation rules |

---

## Backlog

| Size | Task |
|------|------|
| [L] | Build end-to-end customer lifecycle workflow |
| [M] | Introduce reporting module scaffold |

---

## Completed This Sprint

| Task | Completed |
|------|-----------|
| Install ai-system v2 and opencode workflow | [x] |
| Remove deprecated `.ai-system` directory | [x] |

---

## Notes

No application code exists yet; prioritize architecture and stack decisions before feature implementation.
