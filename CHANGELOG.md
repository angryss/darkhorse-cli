# Changelog

## Unreleased — VEP 2.0 terminal candidate

- Integrate exact public `@angryss/vep@2.0.0` across all four scaffolders.
- Generate project-owned VEP state with root exact-pin authority and project-local `visu` delegation.
- Add one-way OpenSpec-to-A1 materialization, deterministic projections, and fail-closed drift checks.
- Delegate CLI and Desktop lifecycle/readiness/risk semantics to project-owned VEP truth.
- Add explicit compatible/incompatible VEP upgrade behavior with immutable completed-history bytes.
- Add terminal integration/negative suites, four-generator real-engineering calibration, relocated package verification, and current integration documentation.
- Final qualified-human independent review remains pending; this entry records no approval or release.

All notable changes to DarkHorse will be documented in this file.

The format is based on Keep a Changelog, and this project currently follows pre-1.0 public-alpha versioning.

## [Unreleased]

### Added

- `darkhorse-dotnet-desktop` — WPF desktop scaffolder with Onion Architecture (5 layers: Common, Domain, Application, Infrastructure, Presentation), DDD, CQRS via MediatR, MVVM via CommunityToolkit.Mvvm, Material Design or WPF UI (Fluent) theme, optional EF Core SQLite persistence, WiX 4 MSI installer with desktop shortcut and launch-on-finish checkbox, GitHub Actions and Azure DevOps CI/CD pipeline generation, and full OpenSpec/context/workflow assets.
- Root open-source governance files.
- Root repository hygiene guidance.
- Public-alpha repository status documentation.

### Notes

- The scaffolders are the initial stable focus.
- MCP and advanced AI adapters remain experimental unless a package documents complete implementation.
- DarkHorse Desktop is a companion/showcase product, not the core framework surface.
