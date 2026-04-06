# Prompt Starters Guide

**Ready-to-use prompts for Copilot, Claude, and Codex on Tauri desktop projects following Dark Horse principles.**

> Copy, paste, and customize. Each prompt is designed to work with the self-contained
> project structure. No external reference needed.

---

## New Project Prompts

### 1. Onboarding / Understand the Project

```
Read context/00-START-HERE.md and openspec/AGENTS.md. Then read openspec/specs/architecture/
to understand the architecture rules. Summarize:
1. The project structure (Cargo workspace + frontend layout)
2. Architecture constraints (Clean Architecture, CQRS via Tauri commands)
3. The development workflow (from openspec/specs/workflow/)
```

### 2. Create First Bounded Context

```
Read openspec/specs/architecture/ for the rules.

Create a new bounded context called "{{context-name}}":
1. Create modules in each crate:
   - crates/<prefix>-domain/src/{{context_name}}/
   - crates/<prefix>-application/src/{{context_name}}/
   - crates/<prefix>-infrastructure/src/{{context_name}}/
2. Add mod.rs in each new module
3. Update context/30-BOUNDED-CONTEXTS.md
```

### 3. Plan First Feature (MVP 1.0)

```
Read openspec/specs/workflow/skills/planning.md.

Create:
1. openspec/specs/project/roadmap.md with goals and features
2. openspec/changes/mvp-1.0/REQ-1.0-001/proposal.md with bounded context, CQRS breakdown
3. openspec/changes/mvp-1.0/REQ-1.0-001/tasks.md with implementation checklist
4. openspec/changes/mvp-1.0/progress-tracker.md with the requirement row
```

### 4. Implement First Feature

```
Read openspec/changes/mvp-1.0/REQ-1.0-001/proposal.md and tasks.md.
Follow openspec/specs/workflow/skills/implementation.md.

Implement inside-out:
- Domain layer first (entities, value objects, traits)
- Application layer (commands, handlers, port traits)
- Infrastructure (SQLite repos, filesystem)
- Desktop shell (Tauri bridge commands, state)
- Frontend (pages, services)
- Tests (#[cfg(test)] modules, in-memory SQLite)

Write all code to crates/ and frontend/src/.
```

---

## Existing Project Prompts

### 5. Onboard to Existing Project

```
Read context/00-START-HERE.md and openspec/AGENTS.md.
Read context/30-BOUNDED-CONTEXTS.md and openspec/specs/project/roadmap.md.
Tell me: what bounded contexts exist, current MVP status, active proposals.
```

### 6. Add a New Bounded Context

```
Read context/30-BOUNDED-CONTEXTS.md.
Add bounded context "{{context-name}}" with modules in all crate src/ directories.
Update context/30-BOUNDED-CONTEXTS.md.
```

### 7. Implement from Proposal

```
Read openspec/changes/{{CHANGE-ID}}/proposal.md and tasks.md.
Follow implementation workflow. Start with Domain layer (zero dependencies),
then Application, Infrastructure, Desktop Shell, Frontend.
All code goes to crates/ and frontend/. Never write code to openspec/.
```

### 8. Fix a Bug

```
Create bug report at openspec/changes/BUG-{{MVP}}-{{###}}/.
Investigate root cause in crates/.
Fix following architecture rules. Add regression test.
```

### 9. Discovery Session

```
Use the Discovery skill at openspec/specs/workflow/skills/discovery.md.

idea: [describe your idea]
mode: discovery

Walk me through the exploration. Produce a DISC-### document
at openspec/changes/discoveries/.
```

### 10. Run All Tests

```
Run cargo test --workspace to verify all crates compile and pass tests.
Report any failures with the affected crate and test name.
```

---

*Guide Version: 1.0 — Tauri 2 + Rust Desktop*
