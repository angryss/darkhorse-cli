# Skill: Nx Monorepo

## Purpose

Analyze Nx topology as optional input to a governed change.

## VEP 2.0 authority boundary

- Installed `@angryss/vep` is the sole process authority.
- OpenSpec may be edited only as optional draft input before A1 materialization.
- Validated `.visu/work/<change-id>/contract.yaml` is the sole editable plan after transition.
- Proposal/tasks are deterministic read-only projections bound to change id, VEP version, A1 hash, projection version, and generation id.
- This skill supplies no lifecycle, gate, risk-tier, artifact, proof, review, or closure semantics.

## Steps

1. Analyze topology, affected projects, constraints, tradeoffs, and proof needs.
2. Before A1, return findings as optional draft material.
3. After A1, require an explicit A1 amendment before topology work.

## Fail-closed recovery

- Invalid candidate: keep current authority unchanged and correct explicit input.
- Existing A1 plus draft overwrite attempt: stop and amend A1 instead.
- Missing or stale projection: regenerate from current validated A1.
- Direct projection edit or cross-change projection: reject; never reverse-sync.
