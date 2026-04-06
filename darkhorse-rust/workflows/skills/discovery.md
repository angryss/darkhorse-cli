# Discovery Skill

> Explore requirements, map bounded contexts, and identify architecture decisions.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `area` | Yes | The area or feature to discover |
| `constraints` | No | Known constraints or requirements |

## Steps

1. **Load context** — Read `context/00-START-HERE.md`, `openspec/AGENTS.md`, and `context/30-BOUNDED-CONTEXTS.md`
2. **Analyze domain** — Review existing entities, values, and services in `crates/<prefix>-domain/src/`
3. **Identify contexts** — Determine which bounded contexts are needed
4. **Map entities** — List entity candidates with their key attributes and invariants
5. **Surface decisions** — Identify architecture decisions that need resolution
6. **Produce report** — Write findings to the discovery output

## Output Format

```markdown
# Discovery Report — [Area]

## Bounded Contexts Identified
- [Context name]: [Purpose and boundary]

## Entity Candidates
- [Entity]: [Key attributes and invariants]

## Value Object Candidates
- [VO]: [Validation rules]

## Port Traits Needed
- [Trait]: [Operations required]

## Architecture Decisions
- [Decision]: [Options and recommendation]

## Next Steps
- [Action items]
```
