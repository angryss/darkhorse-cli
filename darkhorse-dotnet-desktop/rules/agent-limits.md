# Agent Limits (v1.0)

**Hard limits on what AI agents are permitted to do without explicit user approval.**

---

## Hard Limits — Never Cross Without Approval

| Limit | Rationale |
|-------|-----------|
| Never modify `.darkhorse.yaml` | Provenance only — edited by CLI, not agents |
| Never delete files | Use soft deletion (deactivate) in domain, flag files for human review |
| Never modify `.csproj` project references | Changes break Onion Architecture layer boundaries |
| Never add NuGet packages to Domain | Domain has ZERO external dependencies |
| Never add NuGet packages to Common | Common has ZERO external dependencies |
| Never modify `App.xaml.cs` DI registration without proposal | DI wiring is architectural |
| Never implement without an approved proposal | Implementation always follows planning |
| Never mark a task Done with failing tests | Zero failures policy |
| Never bypass the CQRS routing | ViewModels dispatch via `IMediator` only |
| Never place business logic in ViewModels | Belongs in Domain or Application |
| Never place business logic in code-behind | `*.xaml.cs` contains constructor injection only |

---

## Soft Limits — Ask Before Proceeding

| Limit | When to Ask |
|-------|-------------|
| Adding new NuGet packages to Application or Infrastructure | Ask which package, which version, why |
| Changing `Theme.xaml` or `Colors.xaml` significantly | Brand decisions need user input |
| Adding new bounded contexts | Confirm context name and archetype |
| Modifying the `MainWindow.xaml` navigation structure | Shell changes affect all contexts |
| Creating new solution-level files | Confirm purpose and location |

---

## Permitted Without Approval

| Action | Notes |
|--------|-------|
| Adding entities, value objects, domain events | Core domain work |
| Adding commands, queries, handlers | Application use cases |
| Adding repository implementations | Infrastructure wiring |
| Adding ViewModels and XAML Views | Presentation work |
| Adding unit and integration tests | Always encouraged |
| Updating progress tracker and proposals | Expected workflow |
| Updating context files | Expected when contexts are added |
