# DarkHorse Desktop

> **VEP 2.0 authority boundary.** Desktop stores product notes, work-item UI state, and read-only projections. The only developer lifecycle is **Discover → Plan → Implement → Test → Close**. Lifecycle legality, readiness, risk tier, proof/review meaning, and completion are governed by the generated project's exact project-local VEP through the installed Darkhorse CLI delegation boundary. Desktop has no fallback authority. After A1 exists, `.visu/work/<change-id>/contract.yaml` is the sole editable plan authority.

> **Product** — Local-first desktop application for the DarkHorse product-development platform

DarkHorse Desktop is a **product application**, not a scaffolder. It is a local workspace companion for collecting draft input and displaying governed projections. Its product notes and work-item tracking remain local-first; governed lifecycle operations require the selected generated project's local VEP.

### Role in the DarkHorse Ecosystem

| Concern | DarkHorse Desktop |
|---------|-------------------|
| **Is** | A runtime desktop application — a product |
| **Does** | Collects VEP input, delegates governed operations, and displays fresh VEP/A1-derived projections |
| **Consumes** | DarkHorse architectural principles (Clean Architecture, DDD, CQRS) |
| **Does not** | Own templates, init commands, generation workflows, or scaffold logic |

DarkHorse Desktop does not scaffold projects. It does not generate code, copy rules, or render templates. Future Rust/Tauri project scaffolding will be handled by a dedicated scaffolder (`darkhorse-rust`), following the same pattern as `darkhorse-dotnet` and `darkhorse-java`.

When `openspec/`, `context/`, `rules/`, `guides/`, or `workflows/` folders exist in this repo, they are **authored project documentation** — development guidance for building DarkHorse Desktop itself, not scaffold source material.

## Architecture

```
darkhorse-desktop/
├── Cargo.toml                  # Workspace root
├── crates/
│   ├── dh-domain/              # Domain core — entities, value objects, policies, domain services
│   ├── dh-application/         # Application layer — commands, ports (traits), services, orchestration
│   ├── dh-infrastructure/      # Infrastructure — SQLite, filesystem, settings, logging, updates
│   └── dh-desktop/             # Tauri app shell — command bridge, state management, window lifecycle
├── frontend/                   # Vite + TypeScript UI
│   ├── src/
│   │   ├── pages/              # Feature-area pages (dashboard, discovery, planning, requirements, roadmap, progress, artifacts, workspace, settings)
│   │   ├── services/           # Tauri invoke wrappers
│   │   ├── stores/             # Client-side state (ready for expansion)
│   │   ├── components/         # Reusable UI components (ready for expansion)
│   │   └── styles/             # CSS styles
│   └── index.html
└── README.md
```

### Layered Design

| Layer              | Crate              | Responsibility                                                    |
|--------------------|--------------------|--------------------------------------------------------------------|
| **Presentation**   | `frontend/`        | Desktop UI, page composition, user interaction, command invocation  |
| **App Shell**      | `dh-desktop`       | Tauri host, command bridge, window lifecycle, plugin integration    |
| **Application**    | `dh-application`   | Commands/use cases, port traits, orchestration services             |
| **Domain**         | `dh-domain`        | Entities, value objects, policies, domain services                 |
| **Infrastructure** | `dh-infrastructure`| SQLite persistence, filesystem, settings, logging, update support  |

### Design Principles

- **Command-oriented flow** — UI actions map to application commands; no event-driven foundation
- **Clean architecture** — domain is protected from UI and infrastructure concerns
- **Strong modularity** — each crate has distinct, explicit responsibilities
- **Local-first** — SQLite for structured data, filesystem for artifacts, settings store for preferences
- **Workspace-centered** — every entity belongs to a workspace; workspaces are the root context
- **Governed lifecycle projection** — Desktop displays Discover → Plan → Implement → Test → Close only from fresh VEP/project state

## Domain Model

```
Workspace
  └── Initiative
        ├── DiscoverySession ──→ DiscoveryOutput
        │     ├── DiscoveryOption
        │     ├── Tradeoff
        │     └── IdentifiedRisk
        │
        ├── MVP
        │     ├── MvpDecision
        │     ├── ScopeCandidate
        │     ├── Requirement
        │     └── ImplementationSlice
        │
        ├── PlanningOutput
        ├── ArchitectureDecision
        ├── Roadmap → Milestone → RoadmapItem
        ├── ProgressTracker → ProgressEntry
        └── ArtifactManifest → ManifestEntry
```

### Key Entities

| Entity                 | Purpose                                                              |
|------------------------|----------------------------------------------------------------------|
| `Workspace`            | Root context — organizes all work under a local directory            |
| `Initiative`           | High-level product idea or strategic goal                            |
| `DiscoverySession`     | Phased exploration (Framing→Exploring→Converging→Concluded)          |
| `DiscoveryOutput`      | Structured handoff document from discovery into planning             |
| `Mvp`                  | Smallest deliverable increment to validate a hypothesis              |
| `MvpDecision`          | Key decision with rationale and impact classification                |
| `ScopeCandidate`       | Item being evaluated for MVP inclusion (Included/Excluded/Deferred)  |
| `Requirement`          | Functional/non-functional requirement within an MVP scope            |
| `ImplementationSlice`  | Delivery-ready work unit derived from requirements                   |
| `PlanningOutput`       | Structured artifact capturing planning decisions and scope           |
| `ArchitectureDecision` | Lightweight ADR (Proposed→Accepted→Superseded→Deprecated)            |
| `ArtifactManifest`     | Registry of all generated artifacts in a workspace                   |
| `Roadmap`              | Delivery timeline with milestones                                    |
| `ProgressTracker`      | Delivery progress with entries and blockers                          |

### Value Objects

| Value                | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| `Status`             | Legacy organization label retained for existing data; never lifecycle authority |
| `Priority`           | Critical / High / Medium / Low / Nice-to-have                  |
| `ScopeSize`          | Tiny / Small / Medium / Large                                  |
| `ScopeBoundary`      | Included / excluded / deferred scope items                     |
| `ScopeClassification`| Included / Excluded / Deferred / Undecided                     |
| `ArtifactRef`        | Reference to a generated document on disk                      |
| `ArtifactPath`       | Typed local path to a workspace artifact                       |
| `DecisionRationale`  | Chosen option, reasoning, alternatives, constraints            |
| `Tradeoff`           | Tension between two competing dimensions with resolution       |
| `IdentifiedRisk`     | Risk with level, category, and optional mitigation             |
| `RiskLevel`          | Critical / High / Medium / Low / Negligible                    |
| `PlanningReadiness`  | Legacy serialized snapshot retained for lossless migration only |
| `SliceType`          | FullStack / Backend / Frontend / Infrastructure / DataMigration / Integration |

### Domain Services

| Service            | Purpose                                                          |
|--------------------|------------------------------------------------------------------|
| `PlanningService`  | Collects structural planning observations as VEP input            |
| `DiscoveryService` | Collects discovery observations as VEP input; makes no readiness decision |

## Application Commands

### Discovery Workflow
| Command                           | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `start_discovery_session`         | Begin a new discovery session for an initiative     |
| `update_discovery_notebook`       | Organize legacy discovery notes without a process transition |
| `record_discovery_option`         | Add an option for evaluation during discovery       |
| `collect_discovery_vep_input`     | Collect observations without scoring readiness      |
| `list_discovery_sessions`         | List all sessions for an initiative                 |

### Planning & Scope
| Command                           | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `invoke_project_vep`              | Delegate to an installed Darkhorse CLI; preserve exit/output truth |
| `define_mvp_scope`                | Add a scope candidate to an MVP                    |
| `classify_scope_candidate`        | Mark a candidate as Included/Excluded/Deferred     |

### Requirements & Slices
| Command                           | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `add_requirement`                 | Add a requirement to an MVP                        |
| `generate_slices`                 | Generate implementation slices from requirements   |
| `link_requirement_to_slice`       | Connect a requirement to an implementation slice   |
| `update_slice_work_item`          | Update local slice display status; no VEP transition |
| `list_slices`                     | List slices for an MVP                             |

### Artifacts & Workspace
| Command                           | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `export_artifact`                 | Export a named artifact to the workspace filesystem |
| `list_workspace_artifacts`        | List all generated artifacts                        |
| `create_workspace`                | Create a new DarkHorse workspace                  |
| `list_workspaces`                 | List all workspaces                                |
| `load_workspace_summary`          | Load summary data for a workspace                  |

### Local Catalog and Work-item UI
| Command                           | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `create_initiative`               | Create a new initiative                            |
| `load_initiative`                 | Load an existing initiative by ID                  |
| `list_initiatives`                | List all initiatives                               |
| `update_roadmap`                  | Record local product-timeline UI data               |
| `update_progress`                 | Record a local work note; never VEP completion      |
| `get_setting` / `set_setting`     | Read/write UI preferences; VEP/version keys rejected |
| `check_updates`                   | Check for desktop app updates                      |

## Persistence Strategy

| Mechanism      | Role                                                                |
|----------------|---------------------------------------------------------------------|
| **SQLite**     | Structured data — initiatives, MVPs, requirements, discovery sessions, implementation slices, workspaces, settings |
| **Filesystem** | Generated artifacts — discovery outputs, planning docs, ADRs, exports |
| **Settings**   | App preferences stored in SQLite `settings` table                    |

Database migrations (7 total) are applied automatically on startup via embedded SQL files.

### SQLite vs Filesystem Boundaries

- Entity data (sessions, decisions, scope candidates, slices) → **SQLite** with JSON serialization for rich nested structures
- Generated documents (markdown, exports, bundles) → **Filesystem** organized by artifact kind under the workspace root
- The `ArtifactManifest` entity bridges both: it tracks filesystem artifacts as first-class domain state in SQLite

## Tauri Command Bridge

The `dh-desktop` crate exposes a typed Tauri boundary. Governed actions use `invoke_project_vep`; all other commands manage draft input, local UI data, or read-only projections.

```typescript
// Start a discovery session
const result = await invoke("start_discovery_session", {
  initiativeId: "...",
  title: "Platform Architecture",
  problemStatement: "How should we structure the core services?"
});

// Generate implementation slices
const slices = await invoke("generate_slices", {
  mvpId: "...",
  slices: [
    { title: "User Auth", description: "...", sliceType: "fullstack", requirementIds: [] }
  ]
});
```

Each bridge function validates input, delegates to an application command handler, and returns JSON.

## Getting Started

### Prerequisites

- Rust 1.75+ with `cargo`
- Node.js 18+
- Tauri CLI v2: `cargo install tauri-cli --version "^2"`

### Development

```bash
# Install frontend dependencies
cd frontend && npm install && cd ..

# Run in development mode (hot-reloading frontend + Rust backend)
cargo tauri dev

# Run Rust tests
cargo test --workspace

# Build for production
cargo tauri build
```

### Project Structure Conventions

- **Ports** (in `dh-application/src/ports/`) define trait interfaces for infrastructure
- **Adapters** (in `dh-infrastructure/`) implement those traits with concrete storage
- **Commands** (in `dh-application/src/commands/`) are the primary entry points for use cases
- **Bridge** (in `dh-desktop/src/bridge.rs`) maps Tauri invocations to application commands
- **Migrations** (in `dh-infrastructure/migrations/`) are embedded SQL executed on startup

## What This Is Not

This is **not** a distributed system. There are no:
- Event buses or message brokers
- Async service choreography
- Microservice communication patterns
- Heavyweight runtime dependencies

This is a local-first, cross-platform desktop companion designed for useful draft capture and governed projections. It does not model a parallel process: installed Darkhorse delegation and project-local VEP own the single developer lifecycle.
