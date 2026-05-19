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
- NO modifications outside `openspec/changes/`, `context/`, `openspec/specs/project/roadmap.md`
- Output goes to `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md` (add row + update Total Requirements count)
- Update `context/30-BOUNDED-CONTEXTS.md` — add or expand bounded context entry for every proposal that introduces or materially changes a bounded context; mark N/A if purely cross-cutting/infrastructure
- Update `openspec/specs/project/roadmap.md` — add the REQ to the active MVP's Requirements table

## Handoff

After completing, confirm the following closing steps are done:
1. `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/proposal.md` — created
2. `context/30-BOUNDED-CONTEXTS.md` — updated (or marked N/A)
3. `openspec/specs/project/roadmap.md` — REQ added to MVP Requirements table
4. `openspec/changes/mvp-{MVP}/progress-tracker.md` — row added, total updated

Then suggest proceeding to `/implement` with the generated proposal ID.
