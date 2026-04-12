---
description: "Evaluate whether Nx is a good fit for this workspace and produce an adoption plan"
mode: agent
---

Execute the **Nx Monorepo** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/nx-monorepo.md`.

## Context

Load all required context files listed in the skill before producing output.

## Parameters

- **mode**: `plan-ahead` (new product) or `migration` (existing product)
- **name**: Product or workspace name
- **ecosystem**: `dotnet`, `java`, `desktop`, `frontend`, or `mixed`
- **projects**: Comma-separated list of project names
- **pain-points**: Known pain points (migration mode only)

## Output

- Recommendation (recommended / optional / not recommended)
- Fit score (0–100)
- Rationale with benefits, concerns, and complexity tradeoff
- Target monorepo workspace design
- Migration or setup steps with risk levels
