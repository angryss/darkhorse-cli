# 30 — Bounded Contexts

> Inventory of bounded contexts in **test-mobile**.

## Contexts

> No bounded contexts defined yet. Add your first context:
>
> 1. Create folders in each layer under `Contexts/<ContextName>/`
> 2. Add a spec at `openspec/specs/domain/<context-name>.md`
> 3. Update this file with the context description

<!--
## Example Entry

### OrderManagement

- **Purpose:** Handles order lifecycle from creation to fulfillment
- **Entities:** Order, OrderLine, OrderStatus
- **Events:** OrderPlaced, OrderFulfilled, OrderCancelled
- **Aggregates:** Order (root)
- **Domain Location:** `backend/src/{Namespace}.Domain/Contexts/OrderManagement/`
- **Spec:** `openspec/specs/domain/order-management.md`
-->

## Context Map

> Define relationships between bounded contexts here once you have multiple contexts.

| Upstream | Downstream | Pattern |
|----------|------------|---------|
| — | — | — |

### Integration Patterns

- **Published Language:** Shared event schemas between contexts
- **Anti-Corruption Layer:** Translate between context models
- **Shared Kernel:** Common types (use sparingly)
