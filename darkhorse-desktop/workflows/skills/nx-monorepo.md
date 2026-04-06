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
- **Native tooling is preserved.** Rust uses Cargo workspaces. TypeScript uses npm/Vite. Nx orchestrates above them.
- **Scale drives the recommendation.** Single-app products rarely need Nx. Multi-service platforms benefit significantly.
- **Structured output over vague advice.** Every analysis must produce actionable plans.

## Modes

### Plan-Ahead Mode

Used when the user is planning a new product and wants to evaluate Nx from the beginning.

### Migration Mode

Used when the user already has a product and wants to convert or reorganize it into Nx.

## Required Context

```yaml
always:
  - Product name and description
  - Primary ecosystem (dotnet, java, desktop, frontend, mixed)
  - Mode (plan-ahead or migration)

plan-ahead:
  - Intended projects (names, types, technologies)
  - Expected scale (apps count, libs count, team size)
  - Shared code expectations

migration:
  - Current repo structure and root path
  - Existing projects with paths, types, and build tools
  - Known pain points
```

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

### Desktop / Cross-Platform
- Nx orchestrates Cargo (Rust), npm (frontend), and platform builds
- No official Rust/Cargo plugin — use custom targets
- Nx targets: `cargo build`, `cargo test`, `npm run build`
- Tauri-specific workflows remain native

### Frontend
- Nx's strongest native fit
- Use `@nx/vite`, `@nx/js` plugins
- First-class support for component libraries and feature boundaries

### Mixed
- Highest value from Nx — unified orchestration across ecosystems
- Each project retains its native build tool

## Constraints

- **Never force Nx.** The skill must be able to say "not recommended" and mean it.
- **Never replace native toolchains.** Nx wraps; it does not substitute.
- **Always preserve existing build configurations.**
- **Always include risk assessment.**
- **Scale the recommendation.** A solo developer with one app does not need Nx.
