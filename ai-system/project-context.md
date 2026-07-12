# Project Context

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** This project is preparing the foundation for Harvesters CRM. The repository is in initialization stage and currently tracks AI operating documents plus workflow automation. Product and technical implementation are still to be executed.

---

## Project Purpose

Harvesters CRM is intended to centralize customer relationship operations for the Harvesters organization. The current repository stage focuses on creating a reliable AI-assisted execution framework before application code is introduced. This ensures future development is structured, auditable, and repeatable.

---

## Target Users

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| Internal business/admin users | Manage customer records and workflows | CRM dashboard, records management, reporting |
| Engineering contributors | Deliver features safely with shared process | Use ai-system commands, task queue, and checkpoints |

---

## Business Constraints

- Keep documentation and workflows aligned with actual repository state
- Maintain reproducible AI-assisted development processes
- Avoid introducing vendor-locked AI instructions into core system files

---

## Current Project Phase

Phase: Planning

Active sprint focus: bootstrap the new `ai-system` baseline and prepare first implementation tasks.

---

## Tech Decisions Already Made

| Decision | Reason |
|----------|--------|
| Adopt `ai-system` v2 structure from default-template | Standardize AI workflow and quality protocols |
| Add opencode comment-trigger workflow | Enable remote agent execution from GitHub comments |

---

## Out of Scope

- Production feature implementation in this bootstrap task
- Infrastructure and deployment configuration beyond workflow trigger setup

---

## External Integrations

| Service | Purpose | Auth Method |
|---------|---------|------------|
| `sotonye-dagogo-dev/.github-workflows` | Reusable opencode and design runner workflows | GitHub Actions `secrets: inherit` |
