# Prompt Starters — WPF Desktop

Common prompts for AI-assisted development on DarkHorse WPF desktop projects.

---

## Discovery

```
/discover I want to add a feature that lets users [describe feature]. 
What bounded contexts would this touch and what domain concepts are involved?
```

```
/discover What's the right architecture for [feature]? 
Should it be a new bounded context or extend an existing one?
```

---

## Planning

```
/plan Add a [ContextName] bounded context that allows users to [describe purpose].
MVP: 1.0. Include all CQRS commands and queries needed.
```

```
/plan Implement REQ-1.0-001: [requirement description].
Use the existing [ContextName] aggregate root.
```

---

## Implementation

```
/implement REQ-1.0-001 — implement inside-out starting from the Domain layer.
Follow the backend patterns in openspec/specs/patterns/backend-patterns.md.
```

```
/implement the WPF view and viewmodel for the [ContextName] bounded context.
Follow the MVVM patterns in openspec/specs/patterns/frontend-patterns.md.
```

---

## Troubleshooting

```
/troubleshoot The [ContextName] command is throwing [error]. 
Here is the stack trace: [paste stack trace]
```

```
/troubleshoot My ViewModel is not updating the UI when [property] changes.
The binding is: [paste binding]
```

---

## Architecture Reviews

```
Review the [ContextName] domain entity for DDD compliance.
Check for: missing factory methods, public setters, business logic in wrong layer.
```

```
Review the [ContextName]ViewModel for MVVM compliance.
Check for: business logic in ViewModel, direct repository calls, missing IsBusy guards.
```

```
Check the dependency graph for Onion Architecture violations in the [Layer] project.
List any forbidden references found.
```
