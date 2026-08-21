# Skill: Discovery Input

## Authority

VEP input only. This skill never decides lifecycle, readiness, tier, review, proof, or completion.

## Method

1. Select the generated project root; its root `package.json` is sole current VEP-version authority.
2. Record the problem, desired outcome, options, tradeoffs, assumptions, open questions, and risks without choosing a VEP tier.
3. Map each Desktop risk losslessly as `{description, severity, category, mitigation}`. Do not translate severity/category into Tier 1/2/3.
4. Invoke installed Darkhorse `discover`, which delegates to project-local VEP.
5. Preserve exact exit/stdout/stderr. On failure, show the recovery and do not use legacy or cached readiness.
