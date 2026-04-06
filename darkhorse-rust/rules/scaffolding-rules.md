# Scaffolding Rules — Rust/Tauri Desktop

> Rules governing how darkhorse-rust generates project structure.

## Generated Project Completeness

A Dark Horse scaffolder is only complete if it generates **both**:

1. **The runtime product** — Cargo workspace, crates, frontend, deployment config
2. **The development guidance system** — openspec/, context/, AGENTS.md, rules, guides, workflows, roadmap

## Init Pipeline

The `darkhorse-rust init` command executes in this order:

1. **scaffoldProject** — Create directories, render Cargo.toml, crate scaffolds, frontend shell, deployment config
2. **seedOpenSpec** — Copy rules/guides/workflows, render AGENTS.md, roadmap, progress tracker, domain starters
3. **generateContext** — Render context/ navigation files (START-HERE, REPO-MAP, BOUNDED-CONTEXTS, SEARCH-QUERIES)
4. **writeConfig** — Write `.darkhorse.yaml` project configuration

## Template Strategy

| Category | Method | Source |
|----------|--------|--------|
| Cargo.toml files | Handlebars render | `templates/backend/*.hbs` |
| Rust source files | Handlebars render | `templates/backend/<layer>/*.hbs` |
| Frontend files | Handlebars render | `templates/frontend/*.hbs` |
| Deployment files | Handlebars render | `templates/deployment/*.hbs` |
| AGENTS.md | Handlebars render | `templates/openspec/AGENTS.md.hbs` |
| Context files | Handlebars render | `templates/context/*.hbs` |
| Architecture rules | File copy | `rules/*.md` → `openspec/specs/architecture/` |
| Pattern guides | File copy | `guides/*.md` → `openspec/specs/patterns/` |
| Workflow docs | File copy | `workflows/{skills,commands}/*.md` → `openspec/specs/workflow/` |
| Agent definitions | File copy | `workflows/agents/*.md` → `.github/agents/` |
| Roadmap/progress | Handlebars render | `templates/openspec/specs/project/*.hbs` |
| .darkhorse.yaml | Generated at runtime | Config serialization |

## Naming Conventions

- Project names: `kebab-case` (e.g., `photo-editor`)
- Crate prefix: derived from project name or explicitly provided (e.g., `pe` for photo-editor)
- Crate names: `<prefix>-<layer>` (e.g., `pe-domain`, `pe-application`)
- Rust modules: `snake_case`
