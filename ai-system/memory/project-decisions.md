# Project Decisions

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: each entry has its own staleness — check supersedes links

> **Overview:** Log of significant architectural, technical, and product decisions.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Role / Agent / Developer]
**Supersedes:** [link to any prior decision this replaces, or None]
**Superseded by:** [link to any newer decision that replaces this, or None]

**Reason:**
[Why this choice was made]

**Alternatives Considered:**
[What else was evaluated and why it was rejected]

**Implications:**
[What this decision affects going forward]
```

---

## Decisions

## Adopt ai-system v2 Bootstrap Baseline

**Decision:** Use `default-template` as the authoritative baseline for `ai-system` and workflow setup in this repository.
**Date:** 2026-07-12
**Made by:** Implementer
**Supersedes:** None
**Superseded by:** None

**Reason:**
The repository contained an outdated `.ai-system` format. Migrating to the template baseline provides modern protocols, role definitions, and command contracts.

**Alternatives Considered:**
Patch the old `.ai-system` incrementally. Rejected because full replacement is lower risk and keeps the structure aligned with maintained upstream template files.

**Implications:**
Future work should update `ai-system/` files through normal command workflows and keep compatibility with the template model.
