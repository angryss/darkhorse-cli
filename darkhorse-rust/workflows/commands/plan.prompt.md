---
description: "Create a DDD-compliant requirement proposal for a feature, enhancement, or bug fix"
mode: agent
---

Execute the **Planning** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/planning.md`.

## Context

Load all required context files listed in the skill before producing output.

## Parameters

- **feature**: What feature or change to plan
- **mvp**: Target MVP milestone (e.g., 1.0)
- **priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **context**: Target bounded context name
- **type**: feature / enhancement / bug-fix

## Constraints

- NO code generation — proposals only
- NO modifications outside `openspec/changes/`
- Output goes to `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md`

## Handoff

After completing, suggest proceeding to `/implement` with the proposal ID.
