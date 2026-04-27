---
description: "Reset the deployment environment, run the full stack, guide manual testing, diagnose findings, and hand off to discovery"
mode: agent
---

Execute the **Troubleshooting** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/troubleshooting.md`.

## Context

Load all required context files listed in the skill before producing output.

## Parameters

- **issue**: Description of the problem or bug (optional — may emerge from testing)
- **mvp**: Target MVP milestone (e.g., 2.1)
- **severity**: Critical / High / Medium / Low
- **context**: Affected bounded context name (if known)
- **evidence**: Error messages, logs, or reproduction steps (if known)

## Phases

1. **Environment Reset** — Tear down Docker deployment (containers, volumes, images) and rebuild clean. Run `docker compose down --volumes --remove-orphans`, remove project images, then `docker compose build --no-cache` and `docker compose up -d`. Confirm all services healthy.
2. **Manual Testing** — Guide the user to test. Collect all findings.
3. **Root Cause Analysis** — Analyse findings against DDD/Onion/CQRS rules. Produce bug reports.
4. **Handoff** — Ask the user to move to `@discover` to explore solutions before planning.

## Constraints

- Environment reset is mandatory — never skip Phase 1. Run all Phase 0 commands autonomously in the terminal.
- Output goes to `openspec/changes/mvp-{MVP}/BUG-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md`
- NO source code modifications — troubleshooting produces bug proposals + tasks only. All fixes must flow through **Discovery → Planning → Implementation**.

## Handoff

After completing, do NOT suggest `/plan` or `/implement` directly.
Suggest proceeding to `/discover` (via `@discover`) to explore the solution space first.

Typical chain: **Troubleshooting → Discovery → Planning → Implementation**
