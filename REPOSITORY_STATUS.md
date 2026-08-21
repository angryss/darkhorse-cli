# Repository Status

## VEP 2.0 terminal candidate

DarkHorse's four scaffolders now generate project-owned VEP boundaries pinned exactly to public `@angryss/vep@2.0.0`. The terminal implementation, calibration, package, documentation, security, and preservation checks pass. The candidate is awaiting Brandon Rock's separately supplied final independent review decision; it is not yet approved or complete.

The current lifecycle and authority model is documented in [`docs/vep-2-integration.md`](docs/vep-2-integration.md). No Foundation adoption, publication, push, or protected-consumer mutation is part of this candidate checkpoint.

## Current Maturity Assessment

DarkHorse is currently **public-alpha/pre-alpha quality**. The project has a coherent framework direction and working scaffolders, but it is still being cleaned up for external contributors and broader public trust.

The repository should be considered suitable for early technical review, experimentation, and focused contributions. It is not yet a polished stable OSS platform.

## Stable Surfaces

- **Scaffolder entry point:** `darkhorse-dotnet`, `darkhorse-dotnet-desktop`, `darkhorse-java`, and `darkhorse-rust` are the primary OSS surfaces.
- **Generated project principle:** scaffolded projects should be self-contained after generation.
- **Core scaffold pipeline concept:** command -> agent -> skill remains the intended scaffolder flow.
- **OpenSpec/context generation:** central to the framework value proposition, though still evolving.

## Experimental Surfaces

- **MCP:** present in package surfaces and docs, but not yet treated as a stable implemented protocol layer across the repo.
- **AI adapters:** Copilot and Kiro-oriented outputs exist, but the project still needs a vendor-neutral adapter contract.
- **Workflow packs:** useful but not yet versioned as public compatibility contracts.
- **Desktop app:** a companion/showcase product, not the core framework API.
- **Toolkit packages:** include source-adjacent generated JavaScript and declaration files that need a publishing policy decision before cleanup.

## Known Technical Debt

- Scaffolder packages duplicate core concepts that should eventually be extracted.
- No root workspace package manager strategy is in place yet.
- MCP docs and implementation maturity need alignment; MCP is experimental.
- AI tool support is tool-specific rather than adapter-driven.
- Toolkit packages contain source-adjacent generated `.js` and `.d.ts` files pending per-package build validation before cleanup.

## Roadmap Direction

Near-term (post-launch Phase 5) priorities:

- Watch CI runs and fix Linux environment-specific failures.
- Validate toolkit package builds per package and remove stale source-adjacent artifacts.
- Add maintained generated examples from each scaffolder.
- Publish package-specific stability notes in scaffolder READMEs.
- Validate a clean clone and scaffold run outside the original author environment.
- Run `gitleaks` git history scan before first public promotion.
- Add a desktop-specific validation workflow once Tauri prerequisites are settled.

Longer-term (Phase 6+) priorities:

- Modularize shared scaffolder logic into a core package.
- Version OpenSpec and workflow-pack contracts.
- Introduce a vendor-neutral AI adapter contract.
- Stabilize MCP integration and documentation.
- Add example repos that are intentionally generated and maintained.

## Pre-Launch Status

| Item | Status |
| --- | --- |
| CI workflow (install, type-check, test, build, CLI smoke) | ✓ Added — `.github/workflows/validation.yml` |
| Root `.gitignore` | ✓ Added |
| OSS governance files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY) | ✓ Added |
| License consistency — MIT across all packages and root LICENSE | ✓ Confirmed |
| Branding — DarkHorse consistently used in docs, metadata, user-visible strings | ✓ Done |
| Toolkit JS/DTS artifact policy | ✓ Decided — see Known Technical Debt |
| Contribution and release workflow expectations | ✓ Documented in CONTRIBUTING.md and RELEASE_CHECKLIST.md |
| Git history secret scan | ⚠ Required — run `gitleaks` before first public promotion |
| Maintained generated examples | Deferred to post-launch |
| Package-specific stability notes | Deferred to post-launch |

## Toolkit Artifact Policy

The toolkit packages under `darkhorse-dotnet/toolkit/` and `darkhorse-java/toolkit/` contain source-adjacent `.js`, `.d.ts`, and `.module.css.d.ts` files that were not removed during cleanup phases.

**Decided policy: dedicated build-output.** Distributable JavaScript and declarations belong in `dist/` only. The `src/` folders should be source-only. Source-adjacent `.js` and `.d.ts` candidates are almost certainly stale generated output — toolkit package metadata (`main`, `types`, `exports`) already points to `dist/`. Cleanup is deferred to Phase 5/post-launch because it requires per-package build validation before deletion.

## Deferred Architecture Work

The following work is intentionally deferred and should not block the public alpha launch:

- Extracting shared scaffolder logic into a common core package.
- Moving products, scaffolders, and workflow packs into a restructured monorepo layout.
- Renaming packages or folders for refined public branding.
- Replacing tool-specific AI outputs with a full vendor-neutral adapter contract.
- Formal OpenSpec schema and workflow-pack versioning.
- MCP contract stabilization.
