---
description: "Explore and shape a product idea, feature, or scope change before formal planning"
mode: agent
---

Execute the **Discovery** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/discovery.md`.

## Context

Load all required context files listed in the skill before producing output.

## Parameters

- **idea**: The idea, feature, or change to explore
- **mode**: `discovery` (new idea) or `adjustment` (change to existing plan)
- **mvp**: Target MVP milestone (e.g., 1.0) — optional, may be determined during discovery
- **context**: Related bounded context or existing plan

## Constraints

- NO code generation — discovery documents only
- NO modifications to `backend/`, `frontend/`, or `deployment/`
- Output goes to `openspec/changes/discoveries/DISC-{###}.md`

## Handoff

After completing, suggest proceeding to `/plan` with the discovery output.
