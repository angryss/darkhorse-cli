# Skill: Troubleshooting

## Metadata

```yaml
id: troubleshooting
version: 1.0.0
category: workflow
status: active
```

## Purpose

Diagnose and fix bugs, architecture violations, and runtime issues in WPF desktop projects. Always find root cause before suggesting a fix.

## Steps

1. **Gather symptoms** — Collect error messages, stack traces, and reproduction steps.
2. **Identify category** — Classify the issue (see categories below).
3. **Locate root cause** — Read the relevant files and trace the issue to its origin.
4. **Propose minimal fix** — Fix only what is broken. Do not refactor unrelated code.
5. **Verify architecture compliance** — Ensure the fix does not introduce new violations.
6. **Write regression test** — Add a test that would have caught this bug.
7. **Run full test suite** — `dotnet test` must pass with zero failures after the fix.

## Issue Categories

### Category 1: WPF Binding Issues
**Symptoms:** UI not updating, binding shows nothing, value not propagating

**Checklist:**
- [ ] Property has `[ObservableProperty]` or manual `SetProperty` call
- [ ] DataContext is set in constructor (not in code-behind logic)
- [ ] Binding path matches exact property name (case-sensitive)
- [ ] UpdateSourceTrigger is correct for two-way bindings
- [ ] Not updating from a non-UI thread (use `Application.Current.Dispatcher.InvokeAsync`)

### Category 2: Command Not Executing
**Symptoms:** Button click does nothing, command never fires

**Checklist:**
- [ ] `CanExecute` method is not blocking (check `IsBusy` state)
- [ ] `[RelayCommand]` decorator is present on the method
- [ ] `Command="{Binding YourCommand}"` binding is correct
- [ ] `CommandManager.InvalidateRequerySuggested()` called if CanExecute should re-evaluate

### Category 3: DI Resolution Failure
**Symptoms:** `InvalidOperationException: Cannot resolve service for type`

**Checklist:**
- [ ] Service is registered in `AddApplicationServices()` or `AddInfrastructureServices()`
- [ ] Interface is registered against the correct implementation
- [ ] Service lifetime is appropriate (`Transient`/`Scoped`/`Singleton`)
- [ ] Registration order is correct in `App.xaml.cs`

### Category 4: EF Core / Persistence Issues
**Symptoms:** `DbUpdateException`, migration errors, data not persisted

**Checklist:**
- [ ] Entity has a valid primary key configuration
- [ ] `DbSet<T>` is declared on `ApplicationDbContext`
- [ ] Migration is up to date (`dotnet ef migrations add` / `dotnet ef database update`)
- [ ] `SaveChangesAsync` is called in the repository

### Category 5: Architecture Violation
**Symptoms:** Build error from wrong project reference, or unexpected cross-layer coupling

**Checklist:**
- [ ] Check `.csproj` `<ProjectReference>` entries against allowed dependencies
- [ ] Check `using` statements for forbidden namespace references
- [ ] Domain: no `using Namespace.Infrastructure`, `using Namespace.Application`, WPF types
- [ ] Application: no `using Namespace.Infrastructure`, no EF Core types
- [ ] ViewModel: no direct repository calls, no domain object mutation

### Category 6: Threading Issues
**Symptoms:** `InvalidOperationException: The calling thread cannot access this object`

**Checklist:**
- [ ] Update observable properties on the UI thread via `Application.Current.Dispatcher.InvokeAsync`
- [ ] Avoid `async void` except in event handlers (use `[RelayCommand]` instead)
- [ ] Use `CancellationToken` correctly in async handlers
