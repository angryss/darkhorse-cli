# Skill: Implementation

## Purpose

Apply framework-specific implementation help inside approved A1 scope.

## VEP 2.0 authority boundary

- Installed `@angryss/vep` is the sole process authority.
- OpenSpec may be edited only as optional draft input before A1 materialization.
- Validated `.visu/work/<change-id>/contract.yaml` is the sole editable plan after transition.
- Proposal/tasks are deterministic read-only projections bound to change id, VEP version, A1 hash, projection version, and generation id.
- This skill supplies no lifecycle, gate, risk-tier, artifact, proof, review, or closure semantics.

## Steps

1. Load `.visu/work/<change-id>/contract.yaml` and require installed VEP validation.
2. Call `validateOpenSpecProjections`; stop on missing, stale, altered, mixed, or cross-change views.
3. Implement only A1 scope using the retained architecture and pattern references.
4. Do not tick tasks projections or invent gates, proof families, review tiers, or closure rules.

## Fail-closed recovery

- Invalid candidate: keep current authority unchanged and correct explicit input.
- Existing A1 plus draft overwrite attempt: stop and amend A1 instead.
- Missing or stale projection: regenerate from current validated A1.
- Direct projection edit or cross-change projection: reject; never reverse-sync.
