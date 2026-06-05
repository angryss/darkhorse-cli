---
description: Diagnose and fix bugs or architecture violations in the WPF desktop project
---

# /troubleshoot

Invoke the `@troubleshoot` agent to diagnose issues systematically.

## Usage

```
/troubleshoot [symptom or error description]
```

## Examples

```
/troubleshoot The OrdersViewModel list is not refreshing after I create a new order
/troubleshoot System.InvalidOperationException: Cannot resolve service for type IOrderRepository
/troubleshoot The PlaceOrderCommand is throwing ValidationException but I can't see which field failed
/troubleshoot My WPF binding is not updating — the property is set but the UI doesn't change
```

## What This Produces

- Root cause identification
- Minimal targeted fix
- Regression test to prevent recurrence
- Architecture compliance verification of the fix

## Common Categories

| Category | Keyword |
|----------|---------|
| UI binding issues | `binding`, `not updating`, `not refreshing` |
| DI issues | `cannot resolve`, `null reference on startup` |
| CQRS issues | `command`, `handler`, `mediator` |
| EF Core issues | `migration`, `dbcontext`, `entity` |
| Architecture violations | `dependency`, `violation`, `layer` |
| Threading issues | `cross-thread`, `dispatcher`, `UI thread` |
