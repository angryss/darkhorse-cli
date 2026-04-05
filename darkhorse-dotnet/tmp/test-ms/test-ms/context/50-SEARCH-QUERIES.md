# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-ms** (archetype: microservice).

## Find by Layer



| Pattern | Query |
|---------|-------|
| Domain entities | `*Domain/Contexts/*/Entities/**/*.cs` |
| Value objects | Search for `record` in `*Domain/Contexts/*/ValueObjects/` |
| Domain events | Search for `Event` in `*Domain/Contexts/*/Events/` |
| Command handlers | `*Application/Contexts/*/Commands/**/*.cs` |
| Event handlers | `*Application/Contexts/*/Events/**/*.cs` |
| Query handlers | `*Application/Contexts/*/Queries/**/*.cs` |
| Repository interfaces | Search for `IRepository` in `*Domain/Contexts/` |
| Repository implementations | Search for `Repository` in `*Infrastructure/Contexts/` |
| MassTransit consumers | Search for `IConsumer` in `*Presentation/Contexts/` |
| Integration event publishers | Search for `Publish` or `IPublishEndpoint` in `*Infrastructure/` |

## Find by Bounded Context

```
backend/src/{Namespace}.Domain/Contexts/<ContextName>/         ← grep here for business rules
backend/src/{Namespace}.Application/Contexts/<ContextName>/    ← grep here for use cases
backend/src/{Namespace}.Infrastructure/Contexts/<ContextName>/ ← grep here for persistence/messaging
backend/src/{Namespace}.Presentation/Contexts/<ContextName>/   ← grep here for API endpoints
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

