# Skill: Nx Monorepo

## Metadata

```yaml
id: nx-monorepo
version: 1.0.0
category: workflow
status: active
```

## Purpose

Analyze, plan, and guide Nx monorepo adoption as an optional architectural strategy for Dark Horse products. This skill evaluates whether Nx is a good fit, designs target workspace structure, and produces structured setup or migration plans.

Nx is treated as a **workspace orchestration and platform layer** — not a replacement for native language toolchains.

## Core Philosophy

- **Nx is optional, not mandatory.** This skill can and should conclude "not recommended" when Nx does not fit.
- **Native tooling is preserved.** .NET uses dotnet. Java uses Maven/Gradle. Rust uses Cargo. Nx orchestrates above them.
- **Scale drives the recommendation.** Single-app products rarely need Nx. Multi-service platforms benefit significantly.
- **Structured output over vague advice.** Every analysis must produce actionable plans.

## Modes

### Plan-Ahead Mode

Used when the user is planning a new product and wants to evaluate Nx from the beginning.

This mode:
- Assesses whether Nx fits the intended product shape
- Identifies likely workspace structure (apps, libs, tools, specs)
- Decides which projects belong in the monorepo
- Identifies where shared code and libraries should live
- Plans repo layout and directory organization
- Defines orchestration and generator opportunities
- Outlines CI/CD implications
- Evaluates tradeoffs and complexity

### Migration Mode

Used when the user already has a product and wants to convert or reorganize it into Nx.

This mode:
- Assesses the current repository structure
- Identifies projects, modules, services, and shared assets
- Groups code into apps/libs/tools as appropriate
- Preserves existing native toolchains
- Maps current scripts and build flows into Nx targets
- Identifies migration risks and blockers
- Proposes a phased migration plan
- Produces a structured migration strategy

## Required Context

The skill needs the following to perform analysis:

```yaml
always:
  - Product name and description
  - Primary ecosystem (dotnet, java, desktop, frontend, mixed)
  - Mode (plan-ahead or migration)

plan-ahead:
  - Intended projects (names, types, technologies)
  - Expected scale (apps count, libs count, team size)
  - Shared code expectations
  - CI/CD complexity

migration:
  - Current repo structure and root path
  - Existing projects with paths, types, and build tools
  - Shared assets
  - Known pain points
```

## Reasoning Flow

1. **Identify mode** — plan-ahead or migration
2. **Understand the product shape** — ecosystem, scale, project inventory
3. **Assess fit** — score based on project count, multi-language, shared code, CI complexity, team size, pain points
4. **Determine recommendation** — recommended (≥55), optional (≥30), or not recommended (<30)
5. **Build rationale** — explain why with ecosystem-specific context
6. **Design target workspace** — directory structure, Nx plugins, preset
7. **Map projects** — source → target for migration, or planned → target for new
8. **Identify shared library opportunities** — contracts, models, utils, UI components
9. **Identify generator opportunities** — project scaffolding, bounded context, CQRS handlers
10. **Plan task orchestration** — Nx targets wrapping native build/test/lint commands
11. **Generate steps** — phased setup or migration plan with risk levels
12. **Identify risks** — learning curve, migration disruption, toolchain integration, scale complexity
13. **Assess CI implications** — affected builds, caching, pipeline structure
14. **Determine next action** — concrete suggestion based on recommendation

## Fit Assessment Scoring

| Factor | Condition | Score |
|--------|-----------|-------|
| Project count | ≥5 | +30 |
| Project count | ≥3 | +20 |
| Project count | ≥2 | +10 |
| Multi-language | yes | +15 |
| Shared code needed | yes | +20 |
| CI complexity | high | +20 |
| CI complexity | medium | +10 |
| Team size | ≥5 | +10 |
| Team size | ≥3 | +5 |
| Pain points | ≥3 | +10 |
| Pain points | ≥1 | +5 |

**Thresholds:** ≥55 = recommended, ≥30 = optional, <30 = not recommended

## Ecosystem-Specific Guidance

### Java
- Nx orchestrates above Maven/Gradle
- Module structure remains native
- Use `@jnxplus/nx-maven` plugin for Maven integration
- Nx targets: `mvn compile`, `mvn test`, `mvn package`
- Shared common module for domain primitives and event contracts

### .NET
- Nx orchestrates above `dotnet` CLI
- Solutions and projects remain native
- Use `@nx-dotnet/core` plugin for project registration
- Nx targets: `dotnet build`, `dotnet test`, `dotnet publish`
- Shared contracts library follows existing workspace Contracts pattern

### Desktop / Cross-Platform
- Nx orchestrates Cargo (Rust), npm (frontend), and platform builds
- No official Rust/Cargo plugin — use custom targets
- Nx targets: `cargo build`, `cargo test`, `npm run build`
- Tauri-specific workflows remain native

### Frontend
- Nx's strongest native fit
- Use `@nx/react`, `@nx/vite`, `@nx/js` plugins
- First-class support for component libraries and feature boundaries

### Mixed
- Highest value from Nx — unified orchestration across ecosystems
- Use `@nx/js` and `@nx/vite` as base, add ecosystem-specific plugins
- Each project retains its native build tool

## Output Format

The skill produces:

```
- mode: plan-ahead | migration
- recommendation: recommended | optional | not-recommended
- fitScore: 0–100 numeric score
- summary: One-line assessment with score
- rationale: Multi-line explanation with benefits, concerns, and complexity tradeoff
- targetDesign:
    - workspaceName
    - structure: [{ path, kind, technology, description }]
    - nxPlugins: [list]
    - nxPreset: npm | react-monorepo | ...
- projectMapping: [{ source, target, action, notes }]
- sharedLibraryOpportunities: [{ name, proposedPath, sharedBy, description }]
- generatorOpportunities: [list of descriptions]
- taskOrchestration: [{ taskName, nxTarget, nativeCommand, cacheable, affectable }]
- setupOrMigrationSteps: [{ order, title, description, risk, reversible }]
- risks: [{ area, severity, description, mitigation }]
- tradeoffs: [{ dimension, benefit, cost, verdict }]
- ciConsiderations: [list]
- nextAction: Concrete suggestion with context
```

## Constraints

- **Never force Nx.** The skill must be able to say "not recommended" and mean it.
- **Never replace native toolchains.** Nx wraps; it does not substitute.
- **Always preserve existing build configurations.** Migration must not break existing workflows.
- **Always include risk assessment.** Infrastructure changes carry risk — be honest about it.
- **Scale the recommendation.** A solo developer with one app does not need Nx. A team of 8 with 6 services does.
