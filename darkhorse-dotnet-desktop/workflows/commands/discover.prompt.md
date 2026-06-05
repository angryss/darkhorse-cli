---
description: Explore and shape product ideas for the WPF desktop application
---

# /discover

Invoke the `@discover` agent to explore a feature or idea before formal planning.

## Usage

```
/discover [idea or feature to explore]
```

## Examples

```
/discover I want to add order management so users can create and track orders
/discover Should notifications be a new bounded context or part of the existing Orders context?
/discover What domain events would the Inventory context raise when stock is low?
```

## What This Produces

- Domain concept identification
- Bounded context mapping
- Command and query inventory
- WPF UI surface estimate
- Readiness assessment for `/plan`

## Next Step

After discovery: `/plan [feature] for MVP [X.Y]`
