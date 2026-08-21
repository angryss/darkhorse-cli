# Skill: Planning

## Purpose

Map a complete draft into VEP A1, or amend the existing canonical A1.

## VEP 2.0 authority boundary

- Installed `@angryss/vep` is the sole process authority.
- OpenSpec may be edited only as optional draft input before A1 materialization.
- Validated `.visu/work/<change-id>/contract.yaml` is the sole editable plan after transition.
- Proposal/tasks are deterministic read-only projections bound to change id, VEP version, A1 hash, projection version, and generation id.
- This skill supplies no lifecycle, gate, risk-tier, artifact, proof, review, or closure semantics.

## Steps

1. Load the exact project-local VEP selection and the architecture references.
2. Before A1, require a complete explicit draft and call `materializeOpenSpecDraft`.
3. After A1, call `amendCanonicalA1`; never merge draft or projection text into A1.
4. Treat generated proposal/tasks only as adapter outputs.

## Fail-closed recovery

- Invalid candidate: keep current authority unchanged and correct explicit input.
- Existing A1 plus draft overwrite attempt: stop and amend A1 instead.
- Missing or stale projection: regenerate from current validated A1.
- Direct projection edit or cross-change projection: reject; never reverse-sync.
