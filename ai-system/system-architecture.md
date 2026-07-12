# System Architecture

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: re-verify before trusting if any architecture-affecting commits have been made since last-verified-against-code

> **Overview:** The current architecture is documentation-first. Runtime application layers are not yet implemented; instead, the repository contains AI process artifacts and a GitHub workflow trigger. This architecture should evolve as source modules are added.

---

## Architecture Diagram

```
Repository Root
    ↓
AI Context Entry (ai-context.md)
    ↓
AI System Protocols + Commands (ai-system/)
    ↓
Planning / Memory / Testing Docs
    ↓
GitHub Trigger Workflow (.github/workflows/opencode.yml)
    ↓
Shared External Workflow Runners (sotonye-dagogo-dev/.github-workflows)
```

---

## Module Breakdown

| Module | Responsibility | Key Files | Dependencies |
|--------|---------------|-----------|--------------|
| Context entry | Bootstraps agent understanding | `ai-context.md` | `ai-system/` |
| AI operating system | Defines process, roles, quality gates | `ai-system/protocols/*`, `ai-system/commands/*` | Markdown-only docs |
| Workflow trigger | Routes `/oc` and `/opencode` comments | `.github/workflows/opencode.yml` | Shared workflow repository |

---

## Data Flow

### Standard Request Flow
```
GitHub comment command -> opencode.yml condition match -> reusable runner workflow -> agent execution -> repository updates
```

### Authentication Flow
```
GitHub Actions event context -> inherited repository/organization secrets -> reusable workflow execution
```

### Data Persistence Flow
```
All persistent project state currently stored in Markdown files under ai-system/
```

---

## Configuration Points

| Config Key | Purpose | Location | Default |
|-----------|---------|----------|---------|
| GitHub Actions permissions/secrets | Authorize reusable workflow execution | Repository/Org settings | Inherited at runtime |
| Workflow trigger phrase (`/oc`, `/opencode`) | Starts automation job routing | `.github/workflows/opencode.yml` | Enabled |

All config points listed here should follow the fallback discipline from `standards/engineering-principles.md` §1 and §3 — every config-driven value must have a documented, safe fallback so the system degrades gracefully if the value is missing or malformed.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Documentation | Markdown | N/A |
| Automation | GitHub Actions reusable workflows | N/A |
| Application runtime | Not implemented yet | N/A |
| Database | Not implemented yet | N/A |

---

## Known Constraints & Technical Debt

- No application source code exists yet
- Architecture details for frontend/backend/data layers are intentionally deferred until implementation starts

---

## Architecture History

See `memory/architecture-history.md` for full chronology.
