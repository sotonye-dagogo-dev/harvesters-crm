# Lessons Learned

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: each entry has its own staleness — check supersedes links

> **Overview:** Practical knowledge accumulated during development.

---

## Entry Format

```
## [Lesson Title]

**Context:**
[What situation this came from]

**What We Learned:**
[The insight or pattern discovered]

**Apply When:**
[When future agents/developers should use this knowledge]

**Supersedes:** [link to any prior lesson this replaces, or None]
**Superseded by:** [link to any newer lesson that replaces this, or None]
```

---

## Lessons

## Replace Legacy AI System in One Step

**Context:**
Migrating from an old `.ai-system` tree to the new `ai-system` template structure.

**What We Learned:**
Replacing the entire directory from a known-good template and then bootstrapping project-specific content is cleaner than partial manual migration.

**Apply When:**
Any repository migration where the source and target system versions differ significantly.

**Supersedes:** None
**Superseded by:** None
