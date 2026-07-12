# Repository Map

> **Metadata**
>
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: auto-regenerable — can be derived from `Get-ChildItem -Recurse` or `tree` command. Manual content only where intent cannot be derived from structure.

> **Overview:** Visual map of the project folder structure with purpose descriptions. Updated when the folder structure changes. This file is **auto-regenerable** — use tool-based discovery for ground truth, and treat manual entries here as supplementary context.

---

## Folder Structure

```
harvesters-crm/
│
├── .github/
│   └── workflows/
│       └── opencode.yml           → Comment-triggered AI workflow router
│
├── ai-system/                     → AI development framework and docs
│   ├── agents/                    → Role definitions
│   ├── checkpoints/               → Session and in-progress state
│   ├── commands/                  → Reusable AI command contracts
│   ├── index/                     → Repo map and dependency graph
│   ├── integrations/              → Optional integration references
│   ├── memory/                    → Decisions and lessons logs
│   ├── planning/                  → Project plan and active task queue
│   ├── protocols/                 → Entry, tiering, QA, escalation rules
│   ├── standards/                 → Engineering doctrine
│   ├── summaries/                 → Development history
│   └── testing/                   → Test plan and latest results
│
├── ai-context.md                  → AI session root context
├── .gitignore                     → Ignore rules
└── start-ai-dev.bat               → Legacy local startup helper
```

---

## Directory Descriptions

| Directory | Purpose | Key Files |
| --------- | ------- | --------- |
| `.github/workflows` | CI/automation entry points | `opencode.yml` |
| `ai-system` | AI process system and project docs | `commands/`, `protocols/`, `planning/` |

---

## Entry Points

| Purpose | File |
| ------- | ---- |
| AI session context | `ai-context.md` |
| AI protocol start | `ai-system/protocols/entry-protocol.md` |
| Workflow trigger | `.github/workflows/opencode.yml` |
