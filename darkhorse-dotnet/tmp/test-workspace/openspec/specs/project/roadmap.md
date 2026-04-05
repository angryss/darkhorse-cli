# Roadmap — test-workspace

> Project roadmap. Each MVP is a **fully deliverable piece of work** — independently deployable, testable, and demonstrably valuable.

## MVP Summary

| MVP | Name | Status | Description |
|-----|------|--------|-------------|
| 1.0 | Foundation | Not Started | Core workspace, first service(s), minimal end-to-end flow |

## Requirement IDs

All requirements follow this naming convention:

```
REQ-{MVP}-{###}    ← Feature requirement (full-slice by default)
ENH-{MVP}-{###}    ← Enhancement to an existing requirement
BUG-{MVP}-{###}    ← Bug fix (full-slice if it has a frontend component)
```

Example: `REQ-1.0-001`, `REQ-1.0-002`, `BUG-1.0-001`, `ENH-2.0-001`

## Classification

Every requirement has a **scope** that defines the implementation slice:

| Scope | What It Covers |
|-------|---------------|
| `full-slice` | Domain + Application + Infrastructure + Presentation + Tests + Docs |
| `backend` | Domain + Application + Infrastructure + Presentation + Tests |
| `infrastructure` | Deployment, DevOps, configuration, CI/CD |
| `docs` | Documentation, specs, guides only |

> **Default:** Requirements without a classification are treated as `full-slice`.

---

## MVP 1.0 — Foundation

**Goal:** End-to-end working system. First bounded context operational. Core use cases covered.

**Exit Criteria:**
- At least one service scaffolded and building
- Core bounded context defined
- Critical use cases implemented and tested
- Deployed or runnable locally

### Requirements

| ID | Scope | Priority | Status | Description |
|----|-------|----------|--------|-------------|
| REQ-1.0-001 | full-slice | High | Not Started | _(Define your first feature here)_ |

### Services in MVP 1.0

| Service | Archetype | Status | Notes |
|---------|-----------|--------|-------|
| _(none yet)_ | — | — | Run `darkhorse-dotnet add api` to add a service |

---

## Adding a New MVP

Copy the template below:

```markdown
## MVP {X.Y} — {Name}

**Goal:** {one-sentence deliverable outcome}

**Exit Criteria:**
- {measurable criterion 1}
- {measurable criterion 2}

### Requirements

| ID | Scope | Priority | Status | Description |
|----|-------|----------|--------|-------------|
| REQ-{X.Y}-001 | full-slice | High | Not Started | {description} |

### Services in MVP {X.Y}

| Service | Archetype | Status | Notes |
|---------|-----------|--------|-------|
| {service-name} | api | Not Started | — |
```

## Workflow Reference

```bash
# See active in-progress requirements
ls openspec/changes/

# Create a plan for a requirement
npx darkhorse-dotnet plan

# Implement an approved plan
npx darkhorse-dotnet implement
```
