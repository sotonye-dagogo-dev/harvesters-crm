# Repository Map

> **Overview:** This repository is still a bootstrap workspace, so the folder map is intentionally small. The current tree contains the AI development system, a session launcher, and a few root-level support files; the actual application folders still need to be created. Keep this map updated as soon as the app scaffold lands so agents can navigate the codebase without guessing. Updated whenever the structure changes.

---

## Folder Structure

```text
harvesters-crm/
├── .ai-context.md              → operational project context used by the AI commands
├── .ai-system/                 → AI development system, docs, plans, memories, and commands
│   ├── agents/                 → agent instructions and architecture/design guidance
│   ├── commands/               → reusable bootstrap and workflow prompts
│   ├── docs/                   → CAS product and integration source docs
│   ├── index/                  → repository and dependency maps
│   ├── memory/                 → decisions, lessons, and architecture history
│   ├── planning/               → project plan and sprint task queue
│   ├── checkpoints/            → session log for resumable work
│   ├── summaries/              → development history log
│   └── testing/                → test plan and test results tracking
├── .env.local                  → local environment variables (present, contents not documented here)
└── start-ai-dev.bat            → starts Ollama, codebase-mcp, and VS Code
```

---

## Directory Descriptions

> **Section summary:** Each directory below has a clear role in the current bootstrap process. When the application code is added, this section should expand to include the runtime folders.

| Directory                | Purpose                                                             | Key Files                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.ai-system/agents`      | Development brain: architecture, design, context, repair patterns   | `general-instructions.md`, `system-architecture.md`, `design-system.md`, `project-context.md`, `repair-system.md`                                                    |
| `.ai-system/commands`    | Ready-to-run prompts and workflow commands                          | `bootstrap-project.md`, `dev-cycle.md`, `fix-build.md`, `generate-architecture.md`, `plan-feature.md`, `refactor-codebase.md`, `self-heal.md`, `update-ai-system.md` |
| `.ai-system/docs`        | Source docs for the CAS product and Harvesters integration strategy | `02_cas_prd_engineering_roadmap_v2_1.md`, `PLATFORM_INTEGRATION_GUIDE.md`, `INTEGRATION_FUTURE_PLATFORMS.md`                                                         |
| `.ai-system/index`       | Maps for repo structure and dependencies                            | `repo-map.md`, `dependency-graph.md`                                                                                                                                 |
| `.ai-system/memory`      | Long-lived notes about decisions and lessons                        | `project-decisions.md`, `lessons-learned.md`, `architecture-history.md`                                                                                              |
| `.ai-system/planning`    | High-level plan and immediate task queue                            | `project-plan.md`, `task-queue.md`                                                                                                                                   |
| `.ai-system/checkpoints` | Resumable session log                                               | `session-log.md`                                                                                                                                                     |
| `.ai-system/summaries`   | Development history snapshots                                       | `dev-history.md`                                                                                                                                                     |
| `.ai-system/testing`     | Test planning and test results                                      | `test-plan.md`, `test-results.md`                                                                                                                                    |

---

## Entry Points

> **Section summary:** The only current runtime entry point is the session launcher. The application entry points do not exist yet and should be added in the first scaffold pass.

| Purpose                        | File                                               |
| ------------------------------ | -------------------------------------------------- |
| AI dev bootstrap               | `start-ai-dev.bat`                                 |
| Operational context            | `.ai-context.md`                                   |
| AI system instructions         | `.ai-system/agents/general-instructions.md`        |
| Planned frontend dev server    | `app/` (to be created)                             |
| Planned API surface            | `app/api/**` (to be created)                       |
| Planned config loading         | `lib/config/**` or `src/config/**` (to be created) |
| Planned environment validation | `lib/env.ts` or similar (to be created)            |
