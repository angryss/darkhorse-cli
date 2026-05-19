# Command: Run Planning

Use the **Planning** skill defined in `openspec/specs/workflow/skills/planning.md`.

> A Copilot agent for this command lives at `.github/agents/plan.agent.md`.

## Parameters

- **feature**: What feature or change to plan
- **mvp**: Target MVP milestone (e.g., 1.0, 1.1, 2.0)
- **priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **context**: Target bounded context name
- **type**: feature / enhancement / bug-fix

## Instruction

Read and follow the Planning skill at `openspec/specs/workflow/skills/planning.md`.

Load the required context files listed in the skill, then execute all steps in order.

Produce the output in the exact format defined by the skill.

After completing the proposal, suggest proceeding to the **Implementation** command with the generated proposal ID.

## Invocation Template

```
Use the Planning skill defined in openspec/specs/workflow/skills/planning.md.

feature: [what to plan]
mvp: [target milestone]
priority: [P0/P1/P2/P3]
context: [bounded context]
type: [feature/enhancement/bug-fix]

Follow clean architecture and project rules.

Produce:
- Architecture-compliant proposal at openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/
- Bounded context identification
- Ubiquitous language definitions
- Task breakdown
- Updated context/30-BOUNDED-CONTEXTS.md (or N/A if no bounded context change)
- Updated openspec/specs/project/roadmap.md (REQ added to active MVP Requirements table)
- Updated openspec/changes/mvp-[MVP]/progress-tracker.md
- Proposal ID for implementation
```
