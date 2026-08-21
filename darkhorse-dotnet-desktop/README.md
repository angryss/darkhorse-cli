# darkhorse-dotnet-desktop

> Scaffold .NET WPF desktop applications with Onion Architecture, DDD, CQRS, MVVM, WiX MSI installer, and CI/CD pipelines — batteries included.

Part of the [DarkHorse](../README.md) AI-native engineering framework.

Generated projects pin public `@angryss/vep@2.0.0` exactly at the root and own their VEP state. `discover`, `plan`, `test`, `review`, and `close` delegate to project-local `visu`; `implement` verifies the approved A1 boundary. Optional OpenSpec is draft input only—after materialization A1 is the sole editable plan authority. See [the repository VEP integration contract](../docs/vep-2-integration.md).

---

## What It Scaffolds

One `init` command generates a complete, self-contained WPF desktop project:

**Application (5-layer Onion Architecture):**

| Layer | Project | Key Packages |
|-------|---------|-------------|
| `*.Common` | Primitives, shared contracts | None |
| `*.Domain` | Entities, aggregates, domain events | None |
| `*.Application` | CQRS commands, queries, handlers | MediatR 12, FluentValidation 11 |
| `*.Infrastructure` | Persistence, adapters | EF Core SQLite (optional) |
| `*.Presentation` | WPF UI, ViewModels, DI bootstrap | CommunityToolkit.Mvvm 8, MaterialDesignThemes or WPF UI |

**Deployment:**

| Asset | Location |
|-------|---------|
| WiX 4 MSI installer | `deploy/installer/` |
| Desktop shortcut (optional feature) | Inside WiX installer |
| "Launch now" checkbox on finish | Inside WiX installer |
| GitHub Actions pipeline | `.github/workflows/build-installer.yml` |
| Azure DevOps pipeline | `azure-pipelines.yml` |

**Development guidance system (OpenSpec + context):**

- `openspec/AGENTS.md` — AI agent entry point
- `openspec/specs/architecture/` — Onion + DDD + CQRS + MVVM rules
- `openspec/specs/patterns/` — Implementation and deployment patterns
- `openspec/specs/workflow/` — Discover → Plan → Implement → Troubleshoot skills
- `context/` — 4-file AI navigation layer (START-HERE, REPO-MAP, BOUNDED-CONTEXTS, SEARCH-QUERIES)

---

## Quick Start

```bash
# Install
npm install -g darkhorse-dotnet-desktop

# Scaffold a new WPF project
darkhorse-dotnet-desktop init \
  --name my-app \
  --description "My desktop application" \
  --ui materialdesign \
  --persistence \
  --cicd github-actions

# Add a bounded context (feature module)
cd my-app
darkhorse-dotnet-desktop add --context OrderManagement

# Build the .NET solution
dotnet build MyApp.sln

# Build the MSI installer (after publishing)
dotnet publish src/MyApp.Presentation -c Release -r win-x64 --self-contained true
dotnet build deploy/installer/MyApp.Installer.wixproj -c Release -p:Platform=x64
```

---

## Commands

| Command | Description |
|---------|-------------|
| `init` | Scaffold a complete WPF project |
| `add` | Add a bounded context (feature module) to an existing project |
| `deploy setup-cicd` | Provision CI/CD pipelines via PAT or MCP tool |
| `discover` | Explore and shape a feature idea |
| `plan` | Create a proposal in `openspec/changes/` |
| `implement` | Execute a proposal inside-out (Domain → Presentation) |
| `troubleshoot` | Diagnose architecture or runtime issues |
| `validate` | Validate project structure against DarkHorse rules |
| `mcp-serve` | Start the MCP server for AI agent integration |

### `init` Options

| Option | Default | Description |
|--------|---------|-------------|
| `--name` | prompted | Project name (kebab-case) |
| `--description` | prompted | Project description |
| `--namespace` | PascalCase of name | Root C# namespace |
| `--dotnet-version` | `8` | .NET version: `8` or `9` |
| `--ui` | prompted | UI framework: `materialdesign` or `fluent` |
| `--persistence` / `--no-persistence` | prompted | Include EF Core SQLite |
| `--cicd` | `none` | CI/CD pipeline: `github-actions`, `ado`, or `none` |
| `--ado-url` | — | Azure DevOps org URL (required when `--cicd ado`) |
| `--kiro` / `--no-kiro` | `false` | Generate Kiro steering files |
| `--output` | `.` | Output directory |

### `add` Options

| Option | Description |
|--------|-------------|
| `--context` | Bounded context name (PascalCase, e.g. `OrderManagement`) |
| `--type` | Archetype: `crud`, `event-driven`, or `service-integration` |

---

## Generated Project Structure

```
my-app/
├── src/
│   ├── MyApp.Common/            # Primitives, contracts — no deps
│   ├── MyApp.Domain/            # Entities, aggregates — no external deps
│   ├── MyApp.Application/       # CQRS: commands, queries, handlers
│   ├── MyApp.Infrastructure/    # EF Core, adapters
│   └── MyApp.Presentation/      # WPF App.xaml, Views, ViewModels
├── tests/
│   ├── MyApp.UnitTests/
│   └── MyApp.IntegrationTests/
├── deploy/
│   ├── installer/               # WiX 4 MSI installer project
│   │   ├── MyApp.Installer.wixproj
│   │   ├── Product.wxs          # Features, shortcuts, upgrade logic
│   │   ├── Variables.wxi        # Version, UpgradeCode
│   │   └── ui/ExitDialogOverride.wxs
│   └── ci/                      # CI/CD pipeline templates
├── context/                     # AI navigation layer (4 files)
├── openspec/                    # Spec-driven development system
│   ├── AGENTS.md
│   ├── specs/
│   └── changes/
├── MyApp.sln                    # Visual Studio solution (8 projects)
├── .darkhorse.yaml
└── README.md
```

---

## Architecture Principles

Generated projects enforce these rules (documented in `openspec/specs/architecture/`):

1. **Onion dependencies** — always inward. Domain has zero external packages. Never outward.
2. **CQRS** — commands change state, queries read state. Dispatched exclusively via `IMediator`.
3. **MVVM** — ViewModels dispatch via `IMediator`. Code-behind is constructor injection only.
4. **DDD** — entities have identity-based equality, aggregate roots manage domain events, value objects use value-based equality.
5. **Common layer** — no external dependencies. Shared primitives and interfaces only.
6. **Inside-out implementation** — always implement Domain → Application → Infrastructure → Presentation.

---

## WiX Installer

The generated installer uses [WiX Toolset v4](https://wixtoolset.org/) (SDK-style):

- `WixUI_FeatureTree` dialog set — license agreement, feature selection, progress, finish
- **Desktop shortcut** — optional `<Feature>`, user can opt out during install
- **"Launch now" checkbox** — pre-checked on the exit dialog, runs `WixShellExec`
- `MajorUpgrade` — detects and removes older versions automatically
- **Versioning** — bump `ProductVersion` in `Variables.wxi` before each release
- **UpgradeCode** — never change after first release

Prerequisites for building the installer:

```powershell
dotnet tool install --global wix --version 4.0.*
wix extension add WixToolset.UI.wixext/4.0.*
wix extension add WixToolset.Util.wixext/4.0.*
```

---

## CI/CD Pipelines

| Provider | Trigger | Artifact |
|----------|---------|---------|
| GitHub Actions | Push to `main`, PRs (build+test); version tags `v*.*.*` (MSI) | MSI attached to GitHub Release |
| Azure DevOps | Push to `main`, PRs (build+test); version tags `v*.*.*` (MSI) | MSI as pipeline artifact |

Version is injected from the git tag: `v1.2.3` → `ProductVersion = "1.2.3"` in `Variables.wxi`.

---

## Development

```bash
# Install dependencies
npm install

# Type-check
npm run type-check

# Run tests
npm test

# Build CLI
npm run build

# Test the CLI locally
node dist/index.js --help
node dist/index.js init --name test-app --ui materialdesign --persistence --no-kiro --output ../tmp
```

---

## License

MIT. See [LICENSE](../LICENSE).
