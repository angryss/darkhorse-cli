# Contributing to DarkHorse

DarkHorse is currently public-alpha/pre-alpha quality. Contributions are welcome, but the repository is still being shaped for a broader open-source audience.

## Current Contribution Focus

- Repository hygiene and public documentation.
- Scaffolder correctness for `darkhorse-dotnet`, `darkhorse-java`, and `darkhorse-rust`.
- Generated project quality: templates, OpenSpec assets, context files, rules, guides, and workflows.
- Tests that validate generated output and CLI behavior.
- Vendor-neutral interfaces for AI tool adapters and MCP integration.

Avoid large architecture refactors unless they are tied to an accepted issue or proposal.

## Repository Layout

- `darkhorse-dotnet/`: TypeScript CLI for .NET scaffolding.
- `darkhorse-java/`: TypeScript CLI for Java/Quarkus scaffolding.
- `darkhorse-rust/`: TypeScript CLI for Rust/Tauri scaffolding.
- `darkhorse-desktop/`: Rust/Tauri companion product and showcase app.
- `rules/`, `guides/`, `workflows/`, and `templates/` inside scaffolders: generated-project source assets.

## Local Setup

Each scaffolder currently manages its own package metadata and dependencies.

```bash
cd darkhorse-dotnet
npm install
npm run type-check
npm test
```

Use the same pattern for `darkhorse-java` and `darkhorse-rust`.

For the desktop app:

```bash
cd darkhorse-desktop
cd frontend && npm install && cd ..
cargo test --workspace
```

## Pull Request Guidelines

- Keep changes small and reviewable.
- Do not commit generated dependency or build directories such as `node_modules/`, `dist/`, `target/`, `tmp/`, or generated test projects.
- Do not include secrets, customer data, employer-specific references, or private internal tooling.
- Document behavior changes in `CHANGELOG.md`.
- Add focused tests for scaffolder or template changes.
- Keep public-facing language vendor-neutral unless the file is explicitly for a specific adapter.

## Development Notes

- The scaffolders are the initial stable focus.
- MCP and advanced AI adapters are experimental unless a package explicitly documents them as implemented.
- DarkHorse Desktop is a companion/showcase product, not the core framework surface.
- Generated projects should remain self-contained and should not require the DarkHorse CLI at runtime.
