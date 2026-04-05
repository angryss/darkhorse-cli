# Prompt Starters Guide

**Ready-to-use prompts for Codex, Claude, and Copilot on scaffolded .NET projects.**

> Copy, paste, and customize. Each prompt is designed to work with the self-contained
> project structure. No external reference needed.

---

## New Project Prompts

### 1. Onboarding / Understand the Project

```
Read context/00-START-HERE.md and openspec/AGENTS.md. Then read openspec/specs/architecture/
to understand the architecture rules. Summarize:
1. The project structure (.NET solution layout)
2. Architecture constraints (DDD, Onion Architecture, CQRS)
3. Available toolkit components (from openspec/specs/toolkit/README.md)
4. The development workflow (from openspec/specs/workflow/)
```

### 2. Create First Bounded Context

```
Read openspec/specs/architecture/ for the rules.

Create a new bounded context called "{{context-name}}":
1. Create folders in each layer project:
   - backend/src/Namespace.Domain/Contexts/{{ContextName}}/
   - backend/src/Namespace.Application/Contexts/{{ContextName}}/
   - backend/src/Namespace.Infrastructure/Contexts/{{ContextName}}/
   - backend/src/Namespace.Presentation/Contexts/{{ContextName}}/
2. Add GLOSSARY.md in the Domain context folder
3. Update context/30-BOUNDED-CONTEXTS.md
4. Create openspec/specs/domain/{{context-name}}/
```

### 3. Plan First Feature (MVP 1.0)

```
Read openspec/specs/workflow/planning.md.

Create:
1. openspec/specs/project/mvps/mvp-1.0.md with goals and features
2. openspec/changes/REQ-1.0-001/proposal.md with bounded context, CQRS breakdown
3. openspec/changes/REQ-1.0-001/tasks.md with implementation checklist
```

### 4. Implement First Feature

```
Read openspec/changes/REQ-1.0-001/proposal.md and tasks.md.
Follow openspec/specs/workflow/implementation.md.

Implement inside-out:
- Domain layer first (entities, value objects, events, interfaces)
- Application layer (MediatR command/query handlers)
- Infrastructure (EF Core repositories, MassTransit config)
- Presentation (ASP.NET Core controllers)
- Tests (xUnit + FluentAssertions)

Write all code to backend/src/ and backend/tests/.
```

---

## Existing Project Prompts

### 5. Onboard to Existing Project

```
Read context/00-START-HERE.md and openspec/AGENTS.md.
Read context/30-BOUNDED-CONTEXTS.md and openspec/specs/project/roadmap.md.
Tell me: what bounded contexts exist, current MVP status, active proposals.
```

### 6. Add a New Bounded Context

```
Read context/30-BOUNDED-CONTEXTS.md.
Add bounded context "{{context-name}}" with folders in all layer projects.
Update context/30-BOUNDED-CONTEXTS.md.
```

### 7. Implement from Proposal

```
Read openspec/changes/{{CHANGE-ID}}/proposal.md and tasks.md.
Follow implementation workflow. Start with Domain layer (zero dependencies),
then Application, Infrastructure, Presentation.
All code goes to backend/. Never write code to openspec/.
```

### 8. Fix a Bug

```
Create bug report at openspec/changes/BUG-{{MVP}}-{{###}}/.
Investigate root cause in backend/src/.
Fix following architecture rules. Add regression test.
```

### 9. Architecture Review

```
Read openspec/specs/architecture/.
Review backend/src/ for:
- Domain layer has ZERO NuGet dependencies
- No cross-context imports
- Controllers are thin (delegate to MediatR)
- CQRS naming: PlaceOrderCommand, GetOrderByIdQuery
- Domain events are past-tense: OrderPlacedEvent
```

---

## Universal Opener

```
Read context/00-START-HERE.md and openspec/AGENTS.md.
I want to {{describe your goal}}.
Check the relevant specs and existing proposals before we start.
```

---

*Guide Version: 1.0 | Works with any scaffolded .NET project*
