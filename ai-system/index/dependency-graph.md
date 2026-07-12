# Dependency Graph

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: auto-regenerable — can be derived from import analysis tools. Manual content only for conventions and rules that cannot be inferred from code.

> **Overview:** Maps how modules depend on each other. Since there is no production code yet, this graph documents process and workflow dependencies currently present in the repository.

---

## Module Dependency Map

```
ai-context.md
  → ai-system/protocols/entry-protocol.md
      → ai-system/protocols/*
      → ai-system/commands/*
          → ai-system/planning/*
          → ai-system/testing/*
          → ai-system/memory/*

.github/workflows/opencode.yml
  → sotonye-dagogo-dev/.github-workflows/.github/workflows/opencode-runner.yml@main
  → sotonye-dagogo-dev/.github-workflows/.github/workflows/opendesign-runner.yml@main
```

---

## External Dependencies

| Package | Purpose | Used In |
|---------|---------|---------|
| GitHub Actions reusable workflows | Execute opencode and design jobs | `.github/workflows/opencode.yml` |

---

## Circular Dependency Warnings

None detected in current repository contents.

---

## Dependency Rules

- Protocol files define behavior contracts; command files must align with them.
- Planning, testing, memory, and summary files are consumers of command-driven updates.
- Workflow triggers should delegate execution logic to reusable workflows, not duplicate it locally.
