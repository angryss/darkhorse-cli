# Command: Run Implementation

Use the **Implementation** skill defined in `workflows/skills/implementation.md`.

## Parameters

- **proposal_id**: The proposal ID from planning (e.g., REQ-1.0-001 or BUG-1.0-003)
- **task**: What to implement
- **service**: Target service or bounded context
- **context**: Planning output or additional context

## Instruction

Read and follow the Implementation skill at `workflows/skills/implementation.md`.

Load the proposal from `openspec/changes/<proposal_id>/` and all required context files listed in the skill.

Execute all steps in order, implementing domain-first (inside-out).

Produce the output in the exact format defined by the skill.

After completing implementation, suggest archiving the proposal or proceeding to **Troubleshooting** if issues are found.

## Invocation Template

```
Use the Implementation skill defined in workflows/skills/implementation.md.

proposal_id: [REQ-XXX or BUG-XXX]
task: [what to implement]
service: [target bounded context]
context: [planning output or additional notes]

Follow onion architecture and project rules.

Produce:
- Code changes with file locations
- Tests written
- Context maps updated
- Architecture validation results
```
