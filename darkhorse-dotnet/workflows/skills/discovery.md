# Skill: Discovery

## Metadata

```yaml
id: discovery
version: 1.0.0
category: workflow
status: active
next_skill: planning
```

## Purpose

Guide product discovery and MVP shaping before formal planning begins. This skill fills the gap between raw idea capture and structured requirements. It helps explore, compare, scope, challenge, refine, and shape ideas into clean MVP definitions that the Planning skill can consume directly.

Discovery is collaborative, not prescriptive. It guides structured decision-making rather than dumping generic advice.

## Modes

### Discovery Mode

Used when an idea is early, vague, or still forming.

- Expand the idea to understand its full shape
- Refine scope by identifying what matters most
- Narrow to MVP by separating essential from optional
- Surface missing concerns, risks, and unknowns
- Identify tradeoffs between approaches

### Adjustment Mode

Used when a plan already exists and a new idea, change, or constraint appears.

- Re-evaluate prior decisions in light of new information
- Determine whether scope should shift
- Identify what should be added, removed, deferred, or restructured
- Reconcile old and new thinking without losing prior work
- Produce updated scope recommendation

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/ddd-principles.md
  - openspec/specs/architecture/onion-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md

context:
  - context/00-START-HERE.md
  - context/30-BOUNDED-CONTEXTS.md

project:
  - openspec/specs/project/roadmap.md

existing_discoveries:
  - openspec/changes/discoveries/  # scan for prior DISC-### files

toolkit:
  - openspec/specs/toolkit/README.md  # if frontend is relevant
```

## Steps

1. **Load Context** — Read architecture specs, context maps, roadmap, and any prior discovery documents to understand the current state.

2. **Understand the Idea** — Capture what the user is thinking about. Ask clarifying questions if the idea is vague. Restate the idea back to confirm understanding.

3. **Identify User Goal and Problem** — What problem does this solve? Who benefits? What is the user trying to achieve? If the user cannot articulate the problem, help them find it.

4. **Determine Mode** — Is this a new exploration (discovery) or a change to an existing plan (adjustment)? If adjustment, load the relevant prior discovery or planning documents.

5. **Explore Scope Candidates** — List everything that could be in scope. Do not filter yet. Include features, data, integrations, UI, infrastructure, and cross-cutting concerns.

6. **Identify Missing Concerns** — What has the user not mentioned that likely matters? Consider: authentication, authorization, error handling, data migration, performance, observability, testing, deployment, rollback, backward compatibility.

7. **Compare Options** — Where multiple approaches exist, lay them out side by side. For each option, describe the approach, its strengths, its weaknesses, and its fit for the current context.

8. **Evaluate Tradeoffs** — For each decision point, evaluate:
   - Now vs later (can this be deferred?)
   - Essential vs optional (does MVP need this?)
   - Leverage vs complexity (does this buy disproportionate value?)
   - Speed vs flexibility (are we optimizing for delivery or future change?)

9. **Surface Risks and Constraints** — List known risks, assumptions, and hard constraints. Flag anything that could block or significantly change the plan.

10. **Recommend MVP Direction** — Based on the exploration, recommend what should be in the first deliverable MVP. Clearly separate in-scope from out-of-scope. Explain why deferred items are deferred.

11. **Check for DDD Implications** — If the idea touches domain modeling, bounded contexts, or cross-service communication, flag that deeper DDD discovery should happen during planning. Do not attempt full DDD modeling here.

12. **Produce Structured Output** — Generate the discovery document in the format below.

13. **Recommend Next Step** — Direct the user to the Planning skill with the discovery document as input.

## Output Format

```markdown
# DISC-{###}: {Initiative or MVP Name}

## Problem Statement
{What problem does this solve? Who is affected? What is the current state?}

## User Goal
{What is the user trying to achieve? What does success look like?}

## Discovery Mode
{discovery | adjustment}

## Proposed Scope

### In-Scope
- {item 1}
- {item 2}
- ...

### Out-of-Scope (Deferred)
- {item 1} — {reason for deferral}
- {item 2} — {reason for deferral}
- ...

## Assumptions
- {assumption 1}
- {assumption 2}
- ...

## Constraints
- {constraint 1}
- {constraint 2}
- ...

## Options Considered

### Option A: {Name}
**Approach:** {description}

| Pros | Cons |
|------|------|
| {pro 1} | {con 1} |
| {pro 2} | {con 2} |

### Option B: {Name}
**Approach:** {description}

| Pros | Cons |
|------|------|
| {pro 1} | {con 1} |
| {pro 2} | {con 2} |

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| {decision 1} | {why} |
| {decision 2} | {why} |

## Unresolved Questions
- {question 1}
- {question 2}
- ...

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {risk 1} | High/Medium/Low | High/Medium/Low | {mitigation} |
| {risk 2} | High/Medium/Low | High/Medium/Low | {mitigation} |

## MVP Recommendation
{Clear statement of the recommended MVP direction. What to build first, why, and what the expected outcome is.}

## Planning Handoff
{What the Planning skill needs to know. Suggested bounded contexts, requirement IDs, MVP target, priority, and any special considerations.}

- **Suggested MVP target:** {e.g., 1.0, 1.1, 2.0}
- **Suggested priority:** {P0 / P1 / P2 / P3}
- **Suggested type:** {feature / enhancement}
- **DDD discovery needed:** {yes/no — flag if bounded context modeling is required during planning}
- **Next action:** Proceed to Planning skill with this document as input
```

## Output Location

Discovery documents are stored at:

```
openspec/changes/discoveries/DISC-{###}.md
```

Number sequentially starting from `DISC-001`. Scan the `openspec/changes/discoveries/` directory for existing documents to determine the next number.

## Constraints

- **HARD STOP — Discovery Only:** This skill produces discovery documents ONLY. Writing source code, creating application files, or modifying any file outside `openspec/changes/` is a HARD STOP violation.
- Discovery is not planning. Do not produce formal requirement IDs (REQ-/ENH-/BUG-). Those are created by the Planning skill.
- Discovery is not implementation. Do not write code, create project files, or modify architecture.
- Do not attempt full DDD modeling. Flag it for the Planning skill if needed.
- Never propose new toolkit components (toolkit is frozen).
- Support changing direction at any point. Prior discoveries can be superseded.

## Behavioral Principles

1. **Guide, don't dictate.** Present options and tradeoffs. Let the user decide.
2. **Collaborate, don't lecture.** Frame interactions as "let's think this through together."
3. **Challenge, don't accept blindly.** Push back on unnecessary complexity. Ask "do we need this for MVP?"
4. **Stay MVP-aware.** Actively separate what must ship now from what can wait.
5. **Produce planning-ready output.** The discovery document should flow directly into the Planning skill with minimal translation.

## Next Skill

After discovery is complete, proceed to: **Planning** (`workflows/skills/planning.md`)
