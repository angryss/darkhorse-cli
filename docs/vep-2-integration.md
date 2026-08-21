# VEP 2.0 integration

DarkHorse generates projects that own their engineering process state. DarkHorse supplies scaffolding and adapters; the exact project-local `@angryss/vep@2.0.0` installation supplies lifecycle, artifact, validation, proof, review, and closure semantics.

## One lifecycle

The developer lifecycle is:

```text
Generate/Create project -> Discover -> Plan -> Implement -> Test -> Close
```

`discover`, `plan`, `test`, `review`, and `close` delegate to the generated project's `node_modules/.bin/visu`. `implement` verifies the approved A1 boundary and authorizes normal bounded product work; it does not invent another lifecycle transition. DarkHorse never uses a global `visu`, a bundled VEP copy, its source tree, or a tarball fallback.

## Project-owned authority

- The generated root `package.json` entry `devDependencies["@angryss/vep"] = "2.0.0"` is the sole current VEP version authority.
- The root `package-lock.json` binds that exact public npm release and integrity; it is derived resolution evidence, not a second selection authority.
- `.darkhorse.yaml` records whether VEP integration is enabled and the project-local invocation preference. It does not record another current version.
- `.visu/work/<change-id>/` belongs to the generated project. DarkHorse does not own or retain runtime project state after generation.

Generated projects remain VEP-operable after the DarkHorse package and DarkHorse source tree are removed.

## Optional OpenSpec input and canonical A1

OpenSpec may provide an optional draft. Materialization is one-way:

```text
optional OpenSpec draft -> validated A1 Contract -> deterministic proposal/tasks projections
```

After materialization, `.visu/work/<change-id>/contract.yaml` (A1) is the sole editable plan authority. `proposal.md` and `tasks.md` are read-only derived views bound to the A1 hash and change identifier. Stale, directly edited, or cross-change projections fail closed. Correct A1 through the governed adapter and regenerate; never repair a projection as an independent plan.

## Desktop delegation

DarkHorse Desktop reads lifecycle, readiness, and risk-tier results from the project-owned VEP boundary. Desktop may render those values and supply risk inputs, but it cannot select the tier, override readiness, or retain a competing lifecycle state. CLI and Desktop therefore observe the same governed project truth.

## Explicit upgrades and immutable history

VEP upgrades require an explicit target and authorization. The packaged compatibility manifest determines whether the exact pair is supported.

- Compatible: validate current clean state, update the exact root pin and lock, install and verify the target, regenerate current derived projections, then rerun affected proofs.
- Incompatible: stop without mutation and require a bounded migration plan.
- Floating, `latest`, range, local path, URL, source, or tarball selections are rejected.

Completed A1/A2/A3/A4 artifacts are historical bytes. An upgrade may append current successor state but must not rewrite completed contracts, proofs, reviews, or publication-closure records. Failed installation or verification rolls current state back atomically.

## Fail-closed recovery

Missing packages, unsupported versions, integrity mismatches, conflicting authorities, malformed configuration, stale projections, missing project-local commands, incompatible dirty upgrades, and required historical rewrites all stop before unauthorized mutation. Diagnostics identify the exact recovery boundary; DarkHorse does not emulate VEP or silently downgrade.

## Verification

Terminal verification covers all four generators, the complete CLI and Desktop suites, deterministic generation and projection behavior, the twelve frozen negative families, package dry-runs and relocated execution, dependency audits, historical-byte preservation, and the single qualified independent-human review stage.
