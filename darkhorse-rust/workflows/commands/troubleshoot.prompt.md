---
description: "Diagnose a bug, identify root cause, and produce a structured troubleshooting report"
mode: agent
---

Execute the **Troubleshooting** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/troubleshooting.md`.

## Context

Load all required context files listed in the skill before producing output.

## Parameters

- **issue**: Description of the problem or bug
- **mvp**: Target MVP milestone (e.g., 1.0)
- **severity**: Critical / High / Medium / Low
- **context**: Affected bounded context name
- **evidence**: Error messages, logs, or reproduction steps

## Constraints

- NO source code modifications — reports and proposals only
- Output goes to `openspec/changes/mvp-{MVP}/BUG-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md`

## Handoff

After completing, suggest proceeding to `/plan` to formalize the fix, then `/implement` to apply it.
