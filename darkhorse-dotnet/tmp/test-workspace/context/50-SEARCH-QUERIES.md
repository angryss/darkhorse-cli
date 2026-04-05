# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-workspace** (archetype: ).

## Find by Layer




## Find by Bounded Context

```
backend//src/{Namespace}.Domain/Contexts/<ContextName>/         ← grep here for business rules
backend//src/{Namespace}.Application/Contexts/<ContextName>/    ← grep here for use cases
backend//src/{Namespace}.Infrastructure/Contexts/<ContextName>/ ← grep here for persistence/messaging
backend//src/{Namespace}.Presentation/Contexts/<ContextName>/   ← grep here for API endpoints
```

## Find by Convention

| Convention | Pattern |
|------------|---------|
| Aggregate roots | Classes inheriting `AggregateRoot` or `Entity<T>` |
| CQRS commands | Classes ending in `Command` implementing `IRequest<T>` |
| CQRS queries | Classes ending in `Query` implementing `IRequest<T>` |
| MediatR handlers | Classes implementing `IRequestHandler<TRequest, TResponse>` |
| MassTransit consumers | Classes implementing `IConsumer<T>` |
| REST endpoints | Classes with `[ApiController]` attribute |
| Tests | `*Tests.cs` or `*Test.cs` files |

