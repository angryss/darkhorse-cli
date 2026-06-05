# Scaffolding Rules (v1.0)

**Rules for what DarkHorse .NET Desktop generates and what you customize.**

---

## What Is Generated

On `darkhorse-dotnet-desktop init`:

| Generated | Purpose |
|-----------|---------|
| Five-layer project structure (`src/`) | Onion Architecture skeleton |
| Solution file (`.sln`) | Builds all projects |
| Common primitives | `Entity`, `AggregateRoot`, `ValueObject`, `IDomainEvent`, `ViewModelBase` |
| CQRS examples | `SampleItem` entity, command, query, handler, viewmodel |
| WPF shell | `App.xaml`, `MainWindow.xaml`, `MainWindowViewModel` |
| Resource dictionaries | `Theme.xaml`, `Colors.xaml` |
| DI bootstrapping | `DependencyInjection.cs` per layer |
| OpenSpec system | `openspec/`, `context/`, `AGENTS.md`, rules, guides, workflows |
| AI adapters | `.github/agents/`, `.github/prompts/`, `copilot-instructions.md` |

On `darkhorse-dotnet-desktop add --context <Name>`:

| Generated | Purpose |
|-----------|---------|
| Domain entity | Aggregate root skeleton |
| Command + handler | Create use case |
| Query + handler | List use case |
| ViewModel | MVVM ViewModel |
| View (XAML + code-behind) | WPF UserControl |

---

## What You Must Add

| What | Where |
|------|-------|
| Real domain properties and invariants | `Domain/Entities/<Entity>.cs` |
| Additional commands and queries | `Application/Commands/` and `Application/Queries/` |
| Repository implementations | `Infrastructure/Repositories/` |
| Navigation wiring | `Presentation/Views/MainWindow.xaml` |
| Bounded context specs | `openspec/specs/domain/<Context>.md` |
| Requirements | `openspec/specs/project/roadmap.md` and `changes/mvp-1.0/progress-tracker.md` |

---

## What You Must NOT Change

| What | Why |
|------|-----|
| Layer project references in `.csproj` | Changing these breaks Onion Architecture |
| `Common.Primitives` base classes | All entities and VOs depend on these contracts |
| `DependencyInjection.cs` method signatures | Called by `App.xaml.cs` |
| `ViewModelBase` contract | All ViewModels depend on `IsBusy` and `ErrorMessage` |
| `.darkhorse.yaml` | Provenance only — do not edit manually |
