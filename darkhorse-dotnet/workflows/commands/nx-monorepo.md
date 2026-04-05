# Command: Nx Monorepo

Use the **Nx Monorepo** skill defined in `openspec/specs/workflow/skills/nx-monorepo.md`.

> A Copilot agent for this command lives at `.github/agents/nx-monorepo.agent.md`.

## Parameters

- **mode**: `plan-ahead` (new product) or `migration` (existing product)
- **name**: Product or workspace name
- **description**: Product description
- **ecosystem**: `dotnet`, `java`, `desktop`, `frontend`, or `mixed`
- **projects**: Comma-separated list of intended or existing project names
- **pain-points**: Comma-separated known pain points (migration mode only)

## Instruction

Read and follow the Nx Monorepo skill at `openspec/specs/workflow/skills/nx-monorepo.md`.

Determine whether this is a plan-ahead or migration analysis. Collect the required context, invoke the skill's reasoning flow, and produce the structured output.

The command must:

1. Accept the product context (name, ecosystem, projects, scale)
2. Determine the mode (plan-ahead or migration)
3. Invoke the skill's analysis logic
4. Return a structured result with recommendation, rationale, workspace design, steps, risks, and next action
5. Remain orchestration-focused — the skill performs the reasoning

## Invocation Template

```
Use the Nx Monorepo skill defined in openspec/specs/workflow/skills/nx-monorepo.md.

mode: [plan-ahead / migration]
name: [product name]
ecosystem: [dotnet / java / desktop / frontend / mixed]
projects: [list of intended or existing projects]
pain-points: [known issues, if migration mode]

Follow the skill's reasoning flow:
1. Assess whether Nx is a good fit
2. Design the target workspace structure
3. Map projects to Nx apps/libs/tools
4. Identify shared library opportunities
5. Plan task orchestration
6. Generate setup or migration steps
7. Surface risks and CI considerations

Produce:
- Recommendation (recommended / optional / not recommended)
- Fit score (0–100)
- Rationale with benefits, concerns, and complexity tradeoff
- Target monorepo design
- Project mapping
- Shared library opportunities
- Generator/plugin opportunities
- Task orchestration plan
- Setup or migration steps with risk levels
- Risks and mitigations
- Tradeoffs (dimension, benefit, cost, verdict)
- CI/CD considerations
- Suggested next action
```
