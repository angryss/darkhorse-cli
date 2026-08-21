# Skill: Troubleshooting

## Purpose

Diagnose failures and select the one governed recovery path.

## VEP 2.0 authority boundary

- Installed `@angryss/vep` is the sole process authority.
- OpenSpec may be edited only as optional draft input before A1 materialization.
- Validated `.visu/work/<change-id>/contract.yaml` is the sole editable plan after transition.
- Proposal/tasks are deterministic read-only projections bound to change id, VEP version, A1 hash, projection version, and generation id.
- This skill supplies no lifecycle, gate, risk-tier, artifact, proof, review, or closure semantics.

## Steps

1. Observe current A1, package pin, and projection bindings without mutation.
2. Diagnose the implementation or environment within A1 scope.
3. For semantic correction, use `amendCanonicalA1` and revalidate.
4. For derived drift only, use `regenerateOpenSpecProjections`; this never changes A1 or requires OpenSpec.

## Fail-closed recovery

- Invalid candidate: keep current authority unchanged and correct explicit input.
- Existing A1 plus draft overwrite attempt: stop and amend A1 instead.
- Missing or stale projection: regenerate from current validated A1.
- Direct projection edit or cross-change projection: reject; never reverse-sync.
