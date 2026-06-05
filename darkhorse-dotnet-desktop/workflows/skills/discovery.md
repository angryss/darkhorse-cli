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

Explore and shape product ideas for a WPF desktop application before formal planning. Identify bounded contexts, domain concepts, CQRS surface area, and WPF UI implications.

## Steps

1. **Understand the idea** — Ask clarifying questions about the feature/change. What does the user want to accomplish? What business problem is being solved?
2. **Identify the bounded context** — Is this a new bounded context or an extension of an existing one? Check `context/30-BOUNDED-CONTEXTS.md`.
3. **Define domain concepts** — What entities, value objects, and aggregates are involved? Use the project's ubiquitous language.
4. **Map CQRS surface** — What commands (state changes) and queries (reads) are needed? Keep commands and queries separate.
5. **Assess WPF UI impact** — What new views and viewmodels will this require? Will navigation change?
6. **Check architecture fit** — Which Onion layers will this touch? Will any new external packages be needed?
7. **Estimate MVP fit** — Which MVP does this belong to? Is it in scope?
8. **Produce planning input** — Summarize the discovery output in a format ready for `/plan`.

## Output Format

```markdown
## Discovery Summary

**Feature:** [feature name]
**Bounded Context:** [name — new or existing]
**Domain Concepts:**
  - Entities: [list]
  - Value Objects: [list]
  - Domain Events: [list]

**Commands:**
  - [CommandName]: [what it does]

**Queries:**
  - [QueryName]: returns [DTO name]

**WPF UI:**
  - Views: [list of new views]
  - ViewModels: [list of new viewmodels]
  - Navigation change: yes/no

**Architecture Impact:**
  - New packages: [none / list]
  - Layers affected: [list]

**MVP:** [X.Y]
**Next Step:** /plan [feature] for MVP [X.Y]
```
