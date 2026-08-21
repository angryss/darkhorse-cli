# Prompt Starters — Rust/Tauri project

These prompts assist engineering inside the single governed lifecycle:

`Discover -> Plan -> Implement -> Test -> Close`

The generated project's project-local `visu` owns every governed result. AI prompts cannot approve an A1, expand scope, waive proof, approve review, or close work.

## Discover

Run `darkhorse-rust discover --input <discover-input.json> --json`, then ask:

> Explain the VEP Discover result and help gather missing product evidence. Do not select a tier or transition state.

## Plan

An optional OpenSpec draft may be materialized into A1 first. After that, `.visu/work/<change-id>/contract.yaml` is the sole editable plan authority.

Run `darkhorse-rust plan --input <plan-input.json> --json`, then ask:

> Help improve the canonical A1 within its authorized scope. Do not edit proposal/tasks projections directly or claim approval.

## Implement

Run `darkhorse-rust implement <change-id> --json`, then ask:

> Implement only the approved A1 scope using domain/application/infrastructure crates, Tauri command boundaries, SQLite, frontend IPC, and packaging. Do not persist separate lifecycle state.

## Test

Run `darkhorse-rust test --input <proof-input.json> --json`. When independent review is required, run `darkhorse-rust review --input <review-input.json> --json` as part of the Test stage.

> Help diagnose failed proof without changing the expected result or manufacturing success.

## Close

Run `darkhorse-rust close --input <close-input.json> --json`, then follow the exact VEP next action.

> Summarize the governed close result. Do not infer closure from implementation, local checks, or prose.

## Independent tooling

`troubleshoot`, `validate`, architecture prompts, and platform-specific scaffold commands are independent DarkHorse tools. They may help diagnose or implement, but they are not lifecycle commands and cannot alter VEP state.
