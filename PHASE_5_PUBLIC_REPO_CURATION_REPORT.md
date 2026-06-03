# Phase 5: Public Repository Curation Report

DarkHorse repository curation for public OSS launch under Angry Software Solutions.

> **This document is temporary.** Remove it before or shortly after the first public repository promotion. All durable decisions are preserved in `REPOSITORY_STATUS.md`, `VALIDATION_STATUS.md`, and `RELEASE_CHECKLIST.md`.

---

## Goal

Remove internal cleanup and planning artifacts that accumulated during Phases 1–4. The public repository surface should look curated, intentional, and ready for contributors — not like an AI-assisted cleanup transcript.

---

## Files Removed

| File | Reason |
| --- | --- |
| `PHASE_1_OSS_HYGIENE_REPORT.md` | Internal hygiene audit — decisions preserved |
| `PHASE_2_REPO_TRUST_REPORT.md` | Internal trust review — decisions preserved |
| `PHASE_3_PUBLIC_ALPHA_READINESS_REPORT.md` | Internal readiness assessment — decisions preserved |
| `PHASE_4_PUBLIC_LAUNCH_HARDENING_REPORT.md` | Internal launch hardening report — decisions preserved |
| `OPEN_SOURCE_READINESS.md` | Early internal readiness document — superseded |
| `REPO_CLEANUP_PLAN.md` | Internal cleanup tracking — tasks complete or deferred |
| `ARCHITECTURE_REVIEW.md` | Internal architectural analysis — findings in REPOSITORY_STATUS.md |
| `PUBLIC_POSITIONING.md` | Internal marketing notes — positioning adopted in README |
| `GENERATED_JS_DTS_CANDIDATES.md` | Internal JS/DTS candidate list — policy documented in RELEASE_CHECKLIST.md |

No source code, governance documents, or architecture references were changed during this phase.

---

## Permanent Documents Updated

| File | Changes |
| --- | --- |
| `REPOSITORY_STATUS.md` | Replaced "Public Alpha Checklist" with `Pre-Launch Status` table; marked done items; added `Toolkit Artifact Policy` section with the JS/DTS decision; updated `Known Technical Debt` and `Roadmap Direction` to remove stale content and align with post-Phase 4 state |
| `VALIDATION_STATUS.md` | Added `Phase 4 Validation Results` table (302 tests: dotnet 238, java 23, rust 41); noted CI workflow added; updated `Recommended Fixes` to remove done items and add gitleaks note |
| `RELEASE_CHECKLIST.md` | Added `Toolkit Artifact Policy` section with the decided JS/DTS policy; added `Removed Internal Cleanup Artifacts` section listing deleted files and confirming durable decisions were preserved |

---

## Repository Root After Phase 5

```text
README.md                       Contributor entry point
LICENSE                         MIT license
CONTRIBUTING.md                 Contributor setup and expectations
CODE_OF_CONDUCT.md              Community standards
SECURITY.md                     Vulnerability reporting
CHANGELOG.md                    Version history
REPOSITORY_STATUS.md            Maturity assessment, surfaces, debt, roadmap
RELEASE_CHECKLIST.md            Launch steps, toolkit policy, cleanup record
VALIDATION_STATUS.md            Validation commands and results
ARCHITECTURE.md                 Ecosystem architecture reference
package.json                    Root scripts
.gitignore                      Node, Rust, Tauri, TypeScript, test output
.github/                        CI workflow (validation.yml)
docs/                           examples.md guidance
darkhorse-desktop/              Rust/Tauri companion product
darkhorse-dotnet/               TypeScript CLI — .NET scaffolder
darkhorse-java/                 TypeScript CLI — Java/Quarkus scaffolder
darkhorse-rust/                 TypeScript CLI — Rust/Tauri scaffolder
PHASE_5_PUBLIC_REPO_CURATION_REPORT.md   ← Remove this file after review
```

---

## Remaining Launch Blockers

| Item | Status |
| --- | --- |
| Git history secret scan (`gitleaks`) | Required — not yet run |
| CI workflow proven on GitHub runners | Required — workflow exists, first run pending |
| Toolkit source-adjacent JS/DTS cleanup | Deferred — pending per-package build validation |

---

## Phase 5 Validation

Phase 5 made no changes to source code, test suites, or runtime behavior. No re-validation of scaffolder packages is required for the documentation changes made here.

If Phase 5 is the last change before a commit, run the standard package validation to confirm no regressions before staging:

```bash
npm --prefix darkhorse-dotnet run type-check
npm --prefix darkhorse-java run type-check
npm --prefix darkhorse-rust run type-check
npm --prefix darkhorse-dotnet test
npm --prefix darkhorse-java test
npm --prefix darkhorse-rust test
```

Expected: type-check passes all three packages, 302 tests pass total.

---

## Assessment

The repository root is now curated and ready for public review. The only internal artifact remaining is this report, which should be removed before or immediately after the first public promotion.

The open launch blockers (gitleaks scan, first CI run, toolkit artifact cleanup) are documented and tracked. None block the scaffolders' public-alpha launch.
