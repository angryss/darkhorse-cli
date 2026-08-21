# Release Checklist

DarkHorse is preparing for a public alpha launch under Angry Software Solutions.

## VEP 2.0 terminal integration checkpoint

- [x] Exact public `@angryss/vep@2.0.0` selected by each generated root `package.json`.
- [x] Four generators produce clean-installable VEP-ready projects using project-local `visu`.
- [x] Discover -> Plan -> Implement -> Test -> Close real-engineering calibration passes.
- [x] OpenSpec transitions one-way to canonical A1; stale, direct-edit, and cross-change projections fail closed.
- [x] CLI and Desktop lifecycle/readiness/risk semantics delegate to project-owned VEP state.
- [x] Compatible/incompatible upgrade and A1/A2/A3/A4 byte-preservation regression passes.
- [x] Four package dry-runs and relocated clean installs pass without copied VEP authority or proof leakage.
- [x] CLI tests 465/465, Cargo tests 15/15, Desktop frontend build pass, dependency findings 0.
- [x] Terminal candidate and evidence prepared for the qualified human reviewer.
- [ ] Brandon Rock final independent candidate decision—not yet executed.

No publication or push is authorized by this checkpoint.

## Public Launch Steps

- Confirm the repository name, description, topics, and owner under the public GitHub organization.
- Confirm `LICENSE`, package metadata, README license text, and package lock metadata all align on MIT.
- Run the validation workflow locally where practical:
  - `npm ci` in `darkhorse-dotnet`, `darkhorse-java`, and `darkhorse-rust`
  - `npm run type-check` at the repository root
  - `npm test` at the repository root
  - `npm run build` at the repository root
  - `node dist/index.js --help` in each scaffolder package
- Run a working-tree secret scan.
- Review git history for secrets, private URLs, customer names, and employer-specific references.
- Confirm no generated artifacts, dependency directories, build output, or temporary scaffold outputs are staged.
- Open the first public issues for known alpha limitations and Phase 5 cleanup work.
- Publish with a clear public-alpha announcement and support expectations.

## Contributor Expectations

- Start with scaffolders unless an issue explicitly targets desktop or toolkit work.
- Keep changes small, reviewable, and validated with package-level commands.
- Do not commit generated artifacts or dependency folders.
- Label experimental behavior clearly.
- Prefer vendor-neutral contracts for framework-level behavior.

## Alpha Support Expectations

DarkHorse is public-alpha software. Maintainers should expect:

- breaking changes while package boundaries and contracts mature
- incomplete MCP and AI adapter surfaces
- evolving OpenSpec and workflow-pack formats
- best-effort support through GitHub issues
- no production stability guarantee yet

## Issue Reporting Guidance

Good issues should include:

- affected package or generated project type
- command run
- expected behavior
- actual behavior
- Node version and relevant platform runtime versions
- minimal reproduction steps
- whether the issue affects scaffold generation, generated project behavior, docs, or workflow assets

## Toolkit Artifact Policy

The toolkit packages under `darkhorse-dotnet/toolkit/` and `darkhorse-java/toolkit/` contain source-adjacent `.js`, `.d.ts`, and `.module.css.d.ts` files that are almost certainly stale generated output. Package metadata in both toolkits already points to `dist/` for all distributable entrypoints.

**Policy:** `dist/` is the only location for distributable JavaScript and declarations. `src/` is source-only TypeScript. Source-adjacent generated files should be removed once per-package build validation confirms the toolkit builds successfully from source.

This work is deferred until toolkit build pipelines are validated end to end. It is not a blocker for the scaffolder public alpha.

## Removed Internal Cleanup Artifacts

Before the public repository launch, the following internal cleanup and planning documents were removed from the repository root:

- `PHASE_1_OSS_HYGIENE_REPORT.md` — initial hygiene audit
- `PHASE_2_REPO_TRUST_REPORT.md` — trust and dependency review
- `PHASE_3_PUBLIC_ALPHA_READINESS_REPORT.md` — readiness assessment
- `PHASE_4_PUBLIC_LAUNCH_HARDENING_REPORT.md` — launch hardening report
- `OPEN_SOURCE_READINESS.md` — early readiness assessment
- `REPO_CLEANUP_PLAN.md` — internal cleanup tracking document
- `ARCHITECTURE_REVIEW.md` — internal architectural analysis
- `PUBLIC_POSITIONING.md` — internal marketing positioning notes
- `GENERATED_JS_DTS_CANDIDATES.md` — internal JS/DTS candidate file list

All durable decisions from those documents have been preserved in `REPOSITORY_STATUS.md`, `VALIDATION_STATUS.md`, and this file. No source code, runtime behavior, or governance documents were changed during this cleanup.

## Roadmap Direction

Near-term (Phase 5) priorities:

- watch first CI runs on GitHub; fix environment-specific failures early
- resolve toolkit generated-file policy: validate toolkit package builds, then remove stale source-adjacent artifacts
- add and maintain generated examples from each scaffolder
- publish package-specific stability notes in each scaffolder README
- validate a clean clone and scaffold run outside the original author environment
- run a git history secret scan using `gitleaks` or equivalent before first public promotion
- add a desktop-specific validation workflow once Tauri build prerequisites are settled
- open tracking issues for known alpha limitations

Deferred architecture work (Phase 6+):

- shared scaffolder core extraction into a common utilities package
- formal workflow-pack versioning and compatibility rules
- vendor-neutral AI adapter contract across scaffolded projects
- MCP contract stabilization and documentation
- OpenSpec schema versioning

## Post-Launch Watchlist

After the first public release, monitor and address promptly:

- CI failures on Linux runners that do not reproduce locally
- npm audit vulnerabilities in transitive scaffolder dependencies
- issues reporting broken scaffold outputs or missing generated files
- confusion between scaffolder CLIs and the desktop app
- requests to clarify experimental vs stable surfaces

## GitHub Repository Setup

Before making the repository public:

- set repository description: `AI-native engineering scaffolders for .NET, Java, and Rust/Tauri projects`
- add topics: `darkhorse`, `ai-native`, `scaffolding`, `openspec`, `dotnet`, `java`, `rust`, `tauri`, `developer-tools`
- enable GitHub Issues
- enable GitHub Discussions (optional, for community Q&A)
- add `CODEOWNERS` if multiple maintainers are expected
- confirm the default branch is `main`
- disable force-push protection on `main` if not already set
