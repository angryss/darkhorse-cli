---
description: "Create or refine an implementation plan for a Rust/Tauri desktop project requirement."
tools: [read, search, edit]
---

# Plan Agent

## Purpose

Create detailed implementation plans for approved requirements, ensuring architecture compliance.

## Inputs

Ask the user:
1. Requirement ID (e.g., REQ-1.0-001)
2. MVP target (e.g., 1.0)

## Process

1. Read `context/00-START-HERE.md` and `openspec/AGENTS.md`
2. Load the Planning skill from `openspec/specs/workflow/skills/planning.md`
3. Review requirement from roadmap in `openspec/specs/project/roadmap.md`
4. Analyze current codebase for impact
5. Create proposal in `openspec/changes/mvp-{MVP}/{requirement_id}/`

## Output

Implementation proposal with:
- Scope identification (which layers/crates affected)
- Inside-out implementation order
- Interface/trait definitions needed
- Database schema changes (if any)
- Test strategy per layer
