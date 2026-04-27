# Skill: Troubleshooting

## Metadata

```yaml
id: troubleshooting
version: 2.0.0
category: workflow
status: active
next_skill: discovery
```

## Purpose

Reset the deployment environment to a known-clean state, redeploy the full stack, guide the user through manual testing, identify root cause from reported findings, and produce an actionable bug report that chains into the Discovery skill.

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/architecture-rules.md
  - openspec/specs/architecture/archetype-rules.md
  - openspec/specs/architecture/scaffolding-rules.md
  - openspec/specs/architecture/testing-rules.md
  - openspec/specs/architecture/agent-limits.md

patterns:
  - openspec/specs/patterns/backend-patterns.md
  - openspec/specs/patterns/frontend-patterns.md

context:
  - context/00-START-HERE.md
  - context/10-REPO-MAP.md
  - context/30-BOUNDED-CONTEXTS.md

codebase:
  - backend/        # inspect affected bounded context / service
  - frontend/       # if applicable
  - deployment/     # docker compose, env, scripts
```

## Steps

### Phase 0 — Environment Reset (Clean Slate)

Before any testing begins, tear down the entire deployment and rebuild from scratch. This guarantees that findings reflect the current codebase, not a stale image or leftover volume state.

**Execute these commands autonomously in the terminal** from the `deployment/` directory. Do NOT ask the user to run them:

```powershell
# Step 1 — Stop all running services and remove containers, networks, and volumes
cd deployment
docker compose down --volumes --remove-orphans

# Step 2 — Remove all images built by this compose project (no stale layers)
docker compose images -q | ForEach-Object { if ($_) { docker rmi -f $_ } }

# Step 3 — Rebuild all images from source with no cache
docker compose build --no-cache

# Step 4 — Start the full stack in detached mode
docker compose up -d

# Step 5 — Confirm all services are healthy
docker compose ps
```

> Wait for all services to reach `healthy` or `running` status before proceeding.
> If any service fails to start, capture the logs: `docker compose logs <service-name>`

### Phase 1 — Manual Testing

With a clean deployment running, instruct the user to exercise the system:

1. Confirm the environment is fully up and accessible.
2. Ask the user to reproduce the reported issue or perform exploratory testing.
3. Collect all findings: error messages, unexpected behaviour, logs, screenshots.
4. Ask the user: **"What did you find? Describe each issue with steps to reproduce."**

Continue collecting findings until the user signals they are done testing.

### Phase 2 — Root Cause Analysis

For each finding reported by the user:

1. **Load Rules & Patterns** — Read architecture rules, patterns, and context maps.
2. **Identify Affected Bounded Context** — Determine which context contains the bug.
3. **Identify Affected Layer** — Domain, Application, Infrastructure, or Presentation.
4. **Categorize Bug**:
   - **Application Code Bug** → Log proposal, fix in project.
   - **Toolkit Bug** → OUT OF SCOPE. Do not log.
   - **Architecture Violation** → Refactor to comply with rules.
   - **Cross-Context Issue** → Fix via ACL or Integration Events.
5. **Check for Architecture Violations** — Scan for DDD violations, Onion Architecture violations, CQRS violations, and boundary violations.
6. **Analyze Root Cause** — Trace the issue to its origin using explicit reasoning.
7. **Determine Change Type** — Config change, code fix, infrastructure change, or architecture refactor.
8. **Produce Bug Report** — Create `openspec/changes/mvp-[MVP]/BUG-[MVP]-[###]/proposal.md` with full analysis.
9. **Define Regression Test** — Specify a test that would have caught this bug.
10. **Update Progress Tracker** — Add the bug row to `openspec/changes/mvp-[MVP]/progress-tracker.md` with status `Not Started`.

### Phase 3 — Handoff to Discovery

Once all findings are documented, do NOT proceed to planning directly. Instead:

- Present a summary of all bugs found.
- Explicitly ask the user: **"Are you ready to move to @discover to explore solutions before planning?"**
- When confirmed, hand off to the `@discover` agent with the `/discover` command, passing the identified issues as context.

## Output Format

```markdown
# Troubleshooting Report: [Issue Description]

## Environment Reset
- Teardown completed: yes / no
- Services healthy at test start: yes / no (list any that failed)

## Problem Summary
[One-line description using ubiquitous language]

## Root Cause
[Explicit explanation of why the issue occurs]

## Impacted System
- Bounded Context: [name]
- Layer: domain / application / infrastructure / presentation
- Files: [list of affected files]

## Bug Category
- [ ] Application code bug
- [ ] Architecture violation → Rule: [number]
- [ ] Cross-context issue → Pattern: [ACL/Events]
- [ ] Toolkit bug → OUT OF SCOPE

## Architecture Violations Found
| Check                              | Status |
|------------------------------------|--------|
| Domain depending on infrastructure | ok / violation |
| Cross-context direct imports       | ok / violation |
| Business logic in controllers      | ok / violation |
| Ubiquitous language consistent     | ok / violation |
| CQRS patterns followed             | ok / violation |

## Evidence
[Code snippets, error messages, logs, or traces supporting the analysis]

## Recommended Change Type
config / code-fix / infrastructure / architecture-refactor

## Recommended Fix
[Specific steps to resolve the issue]

## Regression Test
- Test description: [what to test]
- Test location: backend/contexts/<context>/tests/
- Prevents: [what recurrence this blocks]

## Next Actions
- [ ] Create planning proposal: `openspec/changes/mvp-[MVP]/BUG-[MVP]-[###]/`
- [ ] Add to `openspec/changes/mvp-[MVP]/progress-tracker.md` (status: Not Started)
- [ ] Proceed to **@discover** to explore the solution space before planning
```

## Constraints

- The environment reset in Phase 0 is mandatory. Do not skip it. Run all commands autonomously in the terminal.
- NO source code modifications are allowed during troubleshooting. Restrict edits to `openspec/changes/` (BUG proposals + tasks) and other documentation updates required by the skill. All fixes must flow through **Discovery → Planning → Implementation**.
- Do not attempt to fix toolkit problems (toolkit is frozen).
- Bug fixes must respect bounded context boundaries.
- Cross-context bugs require ACL or Events, never direct imports.
- Do not assume missing context — prefer explicit reasoning.
- Architecture violations require refactoring, not workarounds.
- Do not chain directly into Planning. Always route through Discovery first.

## Next Skill

After troubleshooting is complete, route to **Discovery** — not Planning:

- All findings → proceed to **Discovery** (`/discover`) to explore the solution space and shape a fix before committing to a plan.
- **Toolkit bug** → OUT OF SCOPE. Document workaround if critical.

Canonical lifecycle: **Discovery → Planning → Implementation → Troubleshooting → Discovery**
