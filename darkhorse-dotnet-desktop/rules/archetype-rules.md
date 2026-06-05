# Archetype Rules — WPF Desktop (v1.0)

**Defines the structure and constraints for the WPF desktop project type.**

> DarkHorse .NET Desktop generates a single application with five layers. There is one "archetype": a WPF desktop application with Clean Onion Architecture. This file defines the layer-by-layer constraints.

---

## Project Archetype: WPF Desktop Application

| Property | Value |
|----------|-------|
| **Entry Point** | `Presentation/App.xaml.cs` using `Microsoft.Extensions.Hosting` |
| **UI Pattern** | MVVM with CommunityToolkit.Mvvm |
| **CQRS** | MediatR — commands and queries dispatched from ViewModels |
| **DI Container** | `Microsoft.Extensions.DependencyInjection` via generic host |
| **Persistence** | EF Core SQLite (local-first, optional) |
| **Target Framework** | `net{version}.0-windows` with `<UseWPF>true</UseWPF>` |

---

## Layer Constraints

### Common Layer

- **Purpose:** Shared foundation. Stable. Change rarely.
- **Allowed:** Base classes (`Entity`, `AggregateRoot`, `ValueObject`, `IDomainEvent`, `ViewModelBase`), shared interfaces, pure utilities, extension methods.
- **Forbidden:** External NuGet packages, references to any other project layer.

### Domain Layer

- **Purpose:** Business domain model. The heart of the application.
- **Allowed:** Entities, value objects, aggregates, domain events, repository interfaces, domain services.
- **Forbidden:** MediatR, EF Core, WPF, HttpClient, file I/O, any infrastructure concern.
- **External Packages:** None — zero NuGet dependencies beyond `Common`.

### Application Layer

- **Purpose:** Use cases. Orchestrates domain + infrastructure via ports.
- **Allowed:** MediatR `IRequest`/`IRequestHandler`, FluentValidation validators, pipeline behaviors, DTOs, port interfaces.
- **Forbidden:** EF Core `DbContext`, WPF, direct repository implementations, `HttpClient`.
- **Key Packages:** `MediatR`, `FluentValidation`, `Microsoft.Extensions.DependencyInjection.Abstractions`.

### Infrastructure Layer

- **Purpose:** Implements ports. Owns all external I/O.
- **Allowed:** EF Core repositories, SQLite `DbContext`, file system access, OS API calls, HTTP clients.
- **Forbidden:** WPF, domain logic, business rules.
- **Key Packages:** `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.Extensions.DependencyInjection`.

### Presentation Layer

- **Purpose:** WPF UI. Views, ViewModels, resource dictionaries, application entry point.
- **Allowed:** WPF Views (XAML), ViewModels (`CommunityToolkit.Mvvm`), resource dictionaries, `IMediator` calls, DI registration of all layers at startup.
- **Forbidden:** Direct repository calls, domain object manipulation, any business logic.
- **Key Packages:** `CommunityToolkit.Mvvm`, `MaterialDesignThemes` or `WPF-UI`, `Microsoft.Extensions.Hosting`, `MediatR`.

---

## DI Bootstrap Pattern

The Presentation layer owns the DI configuration at startup. All layers register their own services via extension methods:

```csharp
// App.xaml.cs
_host = Host.CreateDefaultBuilder()
    .ConfigureServices(services =>
    {
        services.AddApplicationServices();     // Application/DependencyInjection.cs
        services.AddInfrastructureServices();  // Infrastructure/DependencyInjection.cs
        services.AddTransient<MainWindow>();
        services.AddTransient<MainWindowViewModel>();
    })
    .Build();
```

---

## Feature Module Pattern (Bounded Contexts)

When adding a bounded context, the file structure follows this pattern:

```
src/
├── Namespace.Domain/Entities/<ContextName>.cs               ← aggregate root
├── Namespace.Application/
│   ├── Commands/<ContextName>/Create<ContextName>Command.cs
│   ├── Commands/<ContextName>/Create<ContextName>CommandHandler.cs
│   ├── Queries/<ContextName>/Get<ContextName>Query.cs
│   └── Queries/<ContextName>/Get<ContextName>QueryHandler.cs
├── Namespace.Infrastructure/Repositories/<ContextName>/     ← repo implementation
└── Namespace.Presentation/
    ├── Views/<ContextName>/<ContextName>View.xaml
    └── ViewModels/<ContextName>/<ContextName>ViewModel.cs
```

Each bounded context is independent. Never have one context directly use another's aggregate root.
