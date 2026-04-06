# Command: Run Discovery

Use the **Discovery** skill defined in `openspec/specs/workflow/skills/discovery.md`.

> A Copilot agent for this command lives at `.github/agents/discover.agent.md`.

## Parameters

- **idea**: The idea, feature, or change to explore
- **mode**: `discovery` (new idea) or `adjustment` (change to existing plan)
- **mvp**: Target MVP milestone (e.g., 1.0) — optional, may be determined during discovery
- **context**: Related bounded context or existing plan context

## Instruction

Read and follow the Discovery skill at `openspec/specs/workflow/skills/discovery.md`.

Load the required context files listed in the skill, then execute all steps in order.

Produce the output in the exact format defined by the skill.

After completing the discovery, suggest proceeding to the **Planning** command with the generated discovery document as input.

## Invocation Template

```
Use the Discovery skill defined in openspec/specs/workflow/skills/discovery.md.

idea: [what to explore]
mode: [discovery / adjustment]
mvp: [target milestone, if known]
context: [related bounded context or existing plan]

Follow the discovery workflow steps in order.

Produce:
- Structured discovery document at openspec/changes/discoveries/DISC-{###}.md
- Problem statement and user goal
- Scope recommendation (in-scope and out-of-scope)
- Options considered with pros and cons
- Key decisions and rationale
- Risks, assumptions, and constraints
- MVP recommendation
- Planning handoff with suggested next steps
```
