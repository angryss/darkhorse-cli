# Command: Run Implementation

Use the **Implementation** skill defined in `openspec/specs/workflow/skills/implementation.md`.

> A Copilot agent for this command lives at `.github/agents/implement.agent.md`.

## Parameters

- **proposal_id**: The proposal ID from planning (e.g., REQ-1.0-001 or BUG-1.0-003)
- **mvp**: The target MVP (e.g., 1.0)
- **task**: What to implement
- **service**: Target service or bounded context
- **context**: Planning output or additional context

## Instruction

Read and follow the Implementation skill at `openspec/specs/workflow/skills/implementation.md`.

Load the proposal from `openspec/changes/mvp-<MVP>/<proposal_id>/` and all required context files listed in the skill.

Execute all steps in order, implementing domain-first (inside-out).

Update `openspec/changes/mvp-<MVP>/progress-tracker.md` as tasks complete.

When ALL MVP requirements are Done, archive `openspec/changes/mvp-<MVP>/` → `openspec/archive/mvp-<MVP>/` and update `roadmap.md`.

## Invocation Template

```
Use the Implementation skill defined in openspec/specs/workflow/skills/implementation.md.

proposal_id: [REQ-XXX or BUG-XXX]
mvp: [1.0]
task: [what to implement]
service: [target bounded context]
context: [planning output or additional notes]

Follow onion architecture and project rules.

Produce:
- Code changes with file locations
- Tests written
- Context maps updated
- Architecture validation results
- Updated openspec/changes/mvp-[MVP]/progress-tracker.md
```
