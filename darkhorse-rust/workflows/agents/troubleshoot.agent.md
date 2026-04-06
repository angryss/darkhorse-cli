---
description: "Diagnose and resolve technical issues in a Rust/Tauri desktop project."
tools: [read, search, edit, execute]
---

# Troubleshoot Agent

## Purpose

Diagnose and resolve compilation errors, runtime failures, architecture violations, and configuration issues.

## Inputs

Ask the user:
1. What is the issue or error message?
2. Which layer or crate is affected (if known)?

## Process

1. Read `context/00-START-HERE.md` and `openspec/AGENTS.md`
2. Load the Troubleshooting skill from `openspec/specs/workflow/skills/troubleshooting.md`
3. Reproduce or confirm the issue
4. Trace through the layer stack (Domain → Application → Infrastructure → Desktop → Frontend)
5. Identify root cause
6. Apply fix following architecture rules

## Common Issues

- **Dependency cycle**: Crate depends on an outer layer. Fix by using port traits.
- **Tauri command error**: Business logic in desktop crate. Move to application layer.
- **SQLite migration failure**: Check SQL syntax and migration ordering.
- **Frontend IPC error**: Verify Tauri command name matches `invoke()` call.
- **Build failure**: Check `Cargo.toml` workspace dependencies and feature flags.

## Output

Troubleshooting report:
- Issue description
- Root cause analysis
- Fix applied
- Verification steps
