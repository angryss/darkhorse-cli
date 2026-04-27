# Prompt Starters Guide

**Ready-to-use prompts for Codex, Claude, Copilot, and Augment on scaffolded projects.**

> Copy, paste, and customize. Each prompt is designed to work with the self-contained
> project structure. No external reference needed.
>
> 💡 **Augment users**: When Augment is enabled (see `.darkhorse.yaml`), add
> "Use Augment to search the codebase and verify findings" to any prompt below
> for improved accuracy and cross-repo awareness.

---

## Table of Contents

- [New Project Prompts](#new-project-prompts)
  - [Onboarding / Understand the Project](#1-onboarding--understand-the-project)
  - [Create First Bounded Context](#2-create-first-bounded-context)
  - [Plan First Feature (MVP 1.0)](#3-plan-first-feature-mvp-10)
  - [Implement First Feature](#4-implement-first-feature)
  - [Set Up Frontend](#5-set-up-frontend)
  - [Set Up Deployment](#6-set-up-deployment)
- [Existing Project Prompts](#existing-project-prompts)
  - [Onboard to Existing Project](#7-onboard-to-existing-project)
  - [Add a New Bounded Context](#8-add-a-new-bounded-context)
  - [Plan a New Feature](#9-plan-a-new-feature)
  - [Implement from Proposal](#10-implement-from-proposal)
  - [Fix a Bug](#11-fix-a-bug)
  - [Architecture Review](#12-architecture-review)
  - [Update Context Maps](#13-update-context-maps)
  - [Create New MVP](#14-create-new-mvp)
  - [Discover Workspace Projects](#15-discover-workspace-projects)
  - [Cross-Project Integration](#16-cross-project-integration)
  - [Augment-Enhanced Discovery](#17-augment-enhanced-discovery)

---

## New Project Prompts

### 1. Onboarding / Understand the Project

Get the AI up to speed on a freshly scaffolded project.

#### Codex

```
Read context/00-START-HERE.md and openspec/AGENTS.md. Then read openspec/specs/architecture/
to understand the architecture rules. Summarize:
1. The project structure
2. Architecture constraints (DDD, Onion Architecture, CQRS)
3. Available toolkit components (from openspec/specs/toolkit/README.md)
4. The development workflow (from openspec/specs/workflow/)
```

#### Claude (Cursor)

```
Hey, I just scaffolded this project. Read these files in order:
1. context/00-START-HERE.md
2. openspec/AGENTS.md
3. openspec/specs/architecture/

Then give me a summary of the rules I need to follow and how the project is organized.
```

#### Copilot

```
@workspace Read context/00-START-HERE.md and openspec/AGENTS.md. What are the key
architecture rules and project structure constraints I need to follow?
```

---

### 2. Create First Bounded Context

Scaffold the first DDD bounded context.

#### Codex

```
Read openspec/specs/architecture/ddd-principles.md and openspec/specs/architecture/onion-architecture.md.

Create a new bounded context called "{{context-name}}" with this structure:

backend/contexts/{{context-name}}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── services/
│   └── GLOSSARY.md
├── application/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   ├── dtos/
│   └── interfaces/
├── infrastructure/
│   ├── repositories/
│   ├── messaging/
│   └── persistence/
├── presentation/
│   ├── controllers/
│   └── routes/
├── tests/
│   ├── domain/
│   ├── application/
│   └── integration/
└── README.md

Then:
1. Create GLOSSARY.md with initial domain terms: {{list your terms}}
2. Update context/30-BOUNDED-CONTEXTS.md with the new context
3. Create openspec/specs/domain/{{context-name}}/ with glossary.md and entities.md
```

#### Claude (Cursor)

```
I need to create my first bounded context called "{{context-name}}".

Read the architecture specs in openspec/specs/architecture/ first, then:
1. Create the full DDD folder structure under backend/contexts/{{context-name}}/
2. Add a GLOSSARY.md with these domain terms: {{list your terms}}
3. Update context/30-BOUNDED-CONTEXTS.md
4. Create domain specs in openspec/specs/domain/{{context-name}}/

The key domain concepts are: {{describe your domain}}
```

#### Copilot

```
@workspace I need to create a bounded context called "{{context-name}}" following the DDD
rules in openspec/specs/architecture/. Create the full folder structure under
backend/contexts/{{context-name}}/ with domain, application, infrastructure, presentation,
and tests layers. Include a GLOSSARY.md with terms: {{list your terms}}.
```

---

### 3. Plan First Feature (MVP 1.0)

Create an MVP definition and first feature proposal.

#### Codex

```
Read openspec/specs/workflow/planning.md and openspec/specs/workflow/mvp-milestones.md.

1. Create MVP 1.0 definition at openspec/specs/project/mvps/mvp-1.0.md:
   - Title: "{{MVP Title}}"
   - Goals: {{list 3-5 goals}}
   - Features: {{list features with priorities}}

2. Create the first feature proposal:
   - Directory: openspec/changes/REQ-1.0-001/
   - proposal.md with:
     - Title: "{{Feature Title}}"
     - Bounded Context: {{context-name}}
     - Classification: {{full-slice / backend / frontend}}
     - Priority: P0
     - Commands: {{list commands}}
     - Queries: {{list queries}}
     - Events: {{list events}}
   - tasks.md with implementation checklist

3. Run: openspec validate
```

#### Claude (Cursor)

```
Let's plan MVP 1.0 for this project. Read openspec/specs/workflow/planning.md first.

MVP 1.0: "{{MVP Title}}"
Goals:
- {{Goal 1}}
- {{Goal 2}}
- {{Goal 3}}

First feature: "{{Feature Title}}"
- It belongs to the {{context-name}} bounded context
- It's a {{full-slice / backend / frontend}} feature
- Priority: P0

Create:
1. openspec/specs/project/mvps/mvp-1.0.md
2. openspec/changes/REQ-1.0-001/proposal.md (use the template from planning.md)
3. openspec/changes/REQ-1.0-001/tasks.md

Make sure to identify all commands, queries, and domain events.
```

#### Copilot

```
@workspace Read openspec/specs/workflow/planning.md. Create MVP 1.0 definition at
openspec/specs/project/mvps/mvp-1.0.md with title "{{MVP Title}}" and goals: {{goals}}.
Then create a feature proposal at openspec/changes/REQ-1.0-001/ with proposal.md and
tasks.md for "{{Feature Title}}" in the {{context-name}} context.
```

---

### 4. Implement First Feature

Build from a proposal's tasks.md.

#### Codex

```
Read these files in order:
1. openspec/changes/REQ-1.0-001/proposal.md (what to build)
2. openspec/changes/REQ-1.0-001/tasks.md (implementation checklist)
3. openspec/specs/architecture/onion-architecture.md (rules)
4. openspec/specs/toolkit/README.md (available UI components)

Implement REQ-1.0-001 following the tasks.md checklist:
- Domain layer first (entities, value objects, events)
- Then application layer (commands, queries, handlers)
- Then infrastructure (repositories)
- Then presentation (controllers, routes)
- Check off each task as you complete it

Write all code to backend/contexts/{{context-name}}/.
Do NOT write code to openspec/.
```

#### Claude (Cursor)

```
Time to implement REQ-1.0-001. Read the proposal and tasks:
- openspec/changes/REQ-1.0-001/proposal.md
- openspec/changes/REQ-1.0-001/tasks.md

Follow the implementation workflow in openspec/specs/workflow/implementation.md.
Start with the domain layer (zero dependencies), then application, infrastructure,
and presentation. Check the architecture rules as you go.

All code goes to backend/contexts/{{context-name}}/.
```

#### Copilot

```
@workspace Read openspec/changes/REQ-1.0-001/proposal.md and tasks.md. Implement the
feature following the task checklist. Start with domain entities in
backend/contexts/{{context-name}}/domain/, then commands and handlers in application/,
then repositories in infrastructure/, then controllers in presentation/. Follow the
architecture rules in openspec/specs/architecture/.
```

---

### 5. Set Up Frontend

Initialize the frontend app with toolkit components.

#### Codex

```
Read openspec/specs/toolkit/README.md for available components.
Read openspec/specs/architecture/onion-architecture.md for frontend patterns.

Set up the frontend web application:
1. Initialize frontend/web-app/ with {{React+Vite / Next.js / Angular}}
2. Install toolkit packages: npm install @react-toolkit/design-tokens @react-toolkit/{{packages}}
3. Create the folder structure:
   frontend/web-app/src/
   ├── components/
   ├── pages/
   ├── hooks/
   ├── services/
   ├── store/
   ├── utils/
   └── styles/
4. Set up design tokens from @react-toolkit/design-tokens
5. Create a basic layout using toolkit components
```

#### Claude (Cursor)

```
Let's set up the frontend. Check openspec/specs/toolkit/README.md for available components.

I want to use {{React+Vite / Next.js / Angular}} in frontend/web-app/.
Install these toolkit packages: @react-toolkit/design-tokens, @react-toolkit/{{packages}}

Create the standard folder structure under frontend/web-app/src/ with components, pages,
hooks, services, store, utils, and styles. Set up design tokens and create a basic layout.
```

#### Copilot

```
@workspace Read openspec/specs/toolkit/README.md. Set up a {{React+Vite / Next.js}}
project in frontend/web-app/ and install @react-toolkit/design-tokens. Create the folder
structure: components/, pages/, hooks/, services/, store/, utils/, styles/.
```

---

### 6. Set Up Deployment

Initialize deployment configuration.

#### Codex

```
Set up the deployment folder:

1. Create deployment/dev/docker-compose.yml for local development with:
   - {{list your services: e.g., PostgreSQL, Redis, API server}}
   - Proper networking and volume mounts

2. Create deployment/dev/.env.dev with environment variables

3. Create deployment/scripts/start-dev.ps1 to start the dev environment
4. Create deployment/scripts/stop-dev.ps1 to stop the dev environment

5. Create deployment/prod/ placeholder with docker-compose.yml template

Follow the structure defined in openspec/AGENTS.md.
```

#### Claude (Cursor)

```
Set up the deployment configuration. I need:
- Docker Compose for local dev with {{PostgreSQL / Redis / etc.}}
- Start/stop scripts in deployment/scripts/
- Environment files (.env.dev)

Create everything under deployment/ following the structure in openspec/AGENTS.md.
```

#### Copilot

```
@workspace Create a Docker Compose file at deployment/dev/docker-compose.yml with
{{PostgreSQL, Redis, API server}}. Add deployment/dev/.env.dev with environment variables.
Create deployment/scripts/start-dev.ps1 and stop-dev.ps1 PowerShell scripts.
```

---

## Existing Project Prompts

### 7. Onboard to Existing Project

Quickly understand a project you haven't seen before.

#### Codex

```
Read these files to understand this project:
1. context/00-START-HERE.md
2. openspec/AGENTS.md
3. context/30-BOUNDED-CONTEXTS.md
4. openspec/specs/project/roadmap.md
5. openspec/specs/project/progress-tracker.md

Then tell me:
- What bounded contexts exist and what they do
- What MVP we're currently working on
- What proposals are active in openspec/changes/
- What the next priorities are
```

#### Claude (Cursor)

```
I'm new to this project. Read context/00-START-HERE.md and openspec/AGENTS.md to
understand the structure. Then read context/30-BOUNDED-CONTEXTS.md to see the domain
model. Check openspec/specs/project/roadmap.md for the current MVP and
openspec/changes/ for active work.

Give me a status report: what exists, what's in progress, what's next.
```

#### Copilot

```
@workspace Read context/00-START-HERE.md, openspec/AGENTS.md, and
context/30-BOUNDED-CONTEXTS.md. What bounded contexts exist? What's the current
MVP status from openspec/specs/project/roadmap.md? What proposals are active in
openspec/changes/?
```

---

### 8. Add a New Bounded Context

Add a new domain to an existing project.

#### Codex

```
Read context/30-BOUNDED-CONTEXTS.md to see existing contexts.
Read openspec/specs/architecture/ddd-principles.md for the rules.

Add a new bounded context "{{context-name}}":

1. Create the full DDD structure at backend/contexts/{{context-name}}/
2. Create GLOSSARY.md with terms: {{list terms and definitions}}
3. Add a row to context/30-BOUNDED-CONTEXTS.md
4. Create openspec/specs/domain/{{context-name}}/ with:
   - glossary.md
   - entities.md
   - events.md
5. If this context communicates with {{existing-context}}, document the integration
   pattern (ACL / Events / Shared Kernel) in context/30-BOUNDED-CONTEXTS.md relationships table
6. Update context/10-REPO-MAP.md if needed
```

#### Claude (Cursor)

```
I need a new bounded context called "{{context-name}}".

First read context/30-BOUNDED-CONTEXTS.md to see what already exists.

This context is responsible for: {{describe responsibilities}}
It needs to communicate with {{existing-context}} via {{Events / ACL / API}}

Create:
1. Full DDD structure in backend/contexts/{{context-name}}/
2. GLOSSARY.md with domain terms
3. Domain specs in openspec/specs/domain/{{context-name}}/
4. Update context/30-BOUNDED-CONTEXTS.md with new context and relationships
```

#### Copilot

```
@workspace Read context/30-BOUNDED-CONTEXTS.md. Add a new bounded context
"{{context-name}}" under backend/contexts/ with the full DDD layer structure.
Create a GLOSSARY.md with terms: {{terms}}. Update context/30-BOUNDED-CONTEXTS.md
with the new context and its relationship to {{existing-context}}.
```

---

### 9. Plan a New Feature

Create a proposal for new functionality.

#### Codex

```
Read openspec/specs/workflow/planning.md for the proposal template.
Read context/30-BOUNDED-CONTEXTS.md to identify the right bounded context.
Read openspec/specs/toolkit/README.md to check for existing UI components.

Create a proposal for: "{{Feature Title}}"
- Change ID: REQ-{{MVP}}-{{###}}
- Bounded Context: {{identify or create new}}
- Classification: {{full-slice / backend / frontend / infrastructure}}
- Priority: {{P0 / P1 / P2 / P3}}

Create:
1. openspec/changes/REQ-{{MVP}}-{{###}}/proposal.md
   - Include bounded context identification
   - Define ubiquitous language (new terms)
   - List commands, queries, and events
   - Architecture compliance checklist
   - Toolkit check results

2. openspec/changes/REQ-{{MVP}}-{{###}}/tasks.md
   - Backend tasks (if applicable)
   - Frontend tasks (if applicable)
   - Integration tasks (if cross-context)
   - Context map updates

3. openspec validate
```

#### Claude (Cursor)

```
I want to plan a new feature: "{{Feature Title}}"

Read openspec/specs/workflow/planning.md for the template, then check
context/30-BOUNDED-CONTEXTS.md to find the right bounded context.

This feature should:
- {{Describe what it does}}
- {{Describe the business value}}

Target MVP: {{MVP version}}
Priority: {{P0/P1/P2/P3}}

Create the full proposal in openspec/changes/REQ-{{MVP}}-{{###}}/ with proposal.md
and tasks.md. Make sure to check openspec/specs/toolkit/README.md for existing
components before planning any UI work.
```

#### Copilot

```
@workspace Read openspec/specs/workflow/planning.md. Create a feature proposal at
openspec/changes/REQ-{{MVP}}-{{###}}/ for "{{Feature Title}}". Include proposal.md
with bounded context analysis, ubiquitous language, CQRS breakdown, and architecture
compliance. Include tasks.md with implementation checklist.
```

---

### 10. Implement from Proposal

Pick up a proposal and build it.

#### Codex

```
Read the proposal and implementation workflow:
1. openspec/changes/{{CHANGE-ID}}/proposal.md
2. openspec/changes/{{CHANGE-ID}}/tasks.md
3. openspec/specs/workflow/implementation.md
4. openspec/specs/architecture/onion-architecture.md

Implement {{CHANGE-ID}} following the tasks.md checklist.

Rules:
- Domain layer first (zero dependencies)
- Application layer second (depends only on domain)
- Infrastructure third (implements interfaces)
- Presentation last (thin controllers)
- Check toolkit before building custom UI components
- Update context maps if structure changes
- Check off each task as completed

Write code to backend/contexts/{{context-name}}/ and/or frontend/web-app/src/.
Never write code to openspec/.
```

#### Claude (Cursor)

```
Let's implement {{CHANGE-ID}}. Read the proposal and tasks:
- openspec/changes/{{CHANGE-ID}}/proposal.md
- openspec/changes/{{CHANGE-ID}}/tasks.md

Follow openspec/specs/workflow/implementation.md. Work through the tasks in order,
starting with the domain layer. Let me know when you need decisions or clarification.

All code goes to backend/ and/or frontend/. Not openspec/.
```

#### Copilot

```
@workspace Read openspec/changes/{{CHANGE-ID}}/proposal.md and tasks.md. Implement
following the checklist. Start with domain entities, then application handlers,
then infrastructure repos, then controllers. Follow architecture rules in
openspec/specs/architecture/.
```

---

### 11. Fix a Bug

File a bug proposal and fix it.

#### Codex

```
I found a bug: "{{Bug Description}}"

1. Create bug report:
   - Directory: openspec/changes/BUG-{{MVP}}-{{###}}/
   - proposal.md with:
     - What's broken: {{describe}}
     - Expected behavior: {{describe}}
     - Actual behavior: {{describe}}
     - Bounded Context: {{context-name}}
     - Severity: {{critical / high / medium / low}}
   - tasks.md with fix checklist

2. Read the affected code in backend/contexts/{{context-name}}/

3. Fix the bug following architecture rules:
   - Fix in the correct layer (domain/application/infrastructure/presentation)
   - Don't cross bounded context boundaries
   - Add a regression test

4. Update tasks.md to check off completed items
```

#### Claude (Cursor)

```
I found a bug: "{{Bug Description}}"

It's in the {{context-name}} bounded context. Expected: {{expected}}. Actual: {{actual}}.

Please:
1. Create a bug report at openspec/changes/BUG-{{MVP}}-{{###}}/ with proposal.md and tasks.md
2. Investigate the root cause in backend/contexts/{{context-name}}/
3. Fix it following the architecture rules
4. Add a regression test
5. Check off the tasks when done
```

#### Copilot

```
@workspace Bug: "{{Bug Description}}" in {{context-name}} context. Create a bug report
at openspec/changes/BUG-{{MVP}}-{{###}}/ with proposal.md and tasks.md. Then investigate
and fix the issue in backend/contexts/{{context-name}}/. Add a regression test.
```

---

### 12. Architecture Review

Check if code follows the rules.

#### Codex

```
Read openspec/specs/architecture/ (all files).

Review backend/contexts/{{context-name}}/ for architecture compliance:

Check:
1. Domain layer has ZERO external dependencies
2. No cross-context imports (only through contracts in backend/common/)
3. Repository interfaces defined in application/, implementations in infrastructure/
4. Controllers are thin (no business logic in presentation/)
5. Commands and queries follow CQRS naming: <Action><Entity>Command, Get<Entity>Query
6. Domain events are past-tense: <Entity><Action>Event
7. GLOSSARY.md exists and is up to date
8. All new terms use ubiquitous language consistently

Report any violations with file paths and suggested fixes.
```

#### Claude (Cursor)

```
Do an architecture review of the {{context-name}} bounded context.

Read openspec/specs/architecture/ for the rules, then check backend/contexts/{{context-name}}/:
- Is the domain layer free of external dependencies?
- Are there any cross-context imports?
- Do naming conventions follow CQRS patterns?
- Are controllers thin?
- Is the GLOSSARY.md up to date?

List any violations and how to fix them.
```

#### Copilot

```
@workspace Read openspec/specs/architecture/. Review backend/contexts/{{context-name}}/
for DDD and Onion Architecture compliance. Check for cross-context imports, domain
dependency violations, and CQRS naming convention issues. Report violations.
```

---

### 13. Update Context Maps

Keep navigation docs current after changes.

#### Codex

```
Review the current state of the project:
1. List all directories under backend/contexts/
2. List all proposals in openspec/changes/
3. Read the current context/30-BOUNDED-CONTEXTS.md
4. Read the current context/10-REPO-MAP.md

Update:
1. context/30-BOUNDED-CONTEXTS.md — add any new contexts, update statuses,
   add any new relationships
2. context/10-REPO-MAP.md — reflect any structural changes
3. context/50-SEARCH-QUERIES.md — add search patterns for new entities/handlers
4. context/90-LINKS.md — add links to new specs or important files
```

#### Claude (Cursor)

```
The project has changed since the context maps were last updated. Please:
1. Check what bounded contexts exist in backend/contexts/
2. Compare with context/30-BOUNDED-CONTEXTS.md
3. Update all context/ files to reflect the current state
4. Add any new search patterns to context/50-SEARCH-QUERIES.md
```

#### Copilot

```
@workspace Compare backend/contexts/ directory listing with context/30-BOUNDED-CONTEXTS.md.
Update the context maps to reflect any new bounded contexts, changed relationships, or
structural updates. Also update context/10-REPO-MAP.md and context/50-SEARCH-QUERIES.md.
```

---

### 14. Create New MVP

Define a new milestone and plan features.

#### Codex

```
Read openspec/specs/workflow/mvp-milestones.md for the MVP template.
Read openspec/specs/project/roadmap.md for current status.

Create MVP {{X.X}}:
1. Create openspec/specs/project/mvps/mvp-{{X.X}}.md with:
   - Title: "{{MVP Title}}"
   - Overview: {{describe the milestone goal}}
   - Goals: {{list 3-5 goals}}
   - Features table (ID, title, classification, priority, status)
   - Bounded contexts affected
   - Timeline: Start {{date}}, Target {{date}}

2. Update openspec/specs/project/roadmap.md with the new MVP

3. Create initial feature proposals:
   {{For each feature, create openspec/changes/REQ-X.X-###/}}
```

#### Claude (Cursor)

```
Let's plan MVP {{X.X}}: "{{MVP Title}}"

Read openspec/specs/workflow/mvp-milestones.md and openspec/specs/project/roadmap.md.

Goals for this MVP:
- {{Goal 1}}
- {{Goal 2}}
- {{Goal 3}}

Features I want to include:
- {{Feature 1}} (P0, {{classification}})
- {{Feature 2}} (P1, {{classification}})
- {{Feature 3}} (P1, {{classification}})

Create the MVP definition at openspec/specs/project/mvps/mvp-{{X.X}}.md, update the
roadmap, and create proposal directories for each feature.
```

#### Copilot

```
@workspace Read openspec/specs/workflow/mvp-milestones.md. Create MVP {{X.X}} definition
at openspec/specs/project/mvps/mvp-{{X.X}}.md with title "{{MVP Title}}", goals:
{{goals}}, and features: {{features}}. Update openspec/specs/project/roadmap.md.
```

---

### 15. Discover Workspace Projects

Understand what other projects exist and what they offer.

#### Codex

```
Read context/20-WORKSPACE-PROJECTS.md to understand all projects in the workspace.

For each sibling project, tell me:
1. What it does (purpose)
2. What bounded contexts it has
3. What APIs or services it exposes
4. Whether it has any relationship to this project

Then check: are there any capabilities in sibling projects that overlap with
what we're building? Are there APIs we should consume instead of rebuilding?
```

#### Claude (Cursor)

```
Read context/20-WORKSPACE-PROJECTS.md. I want to understand the full workspace.

For each sibling project, summarize what it does and what bounded contexts it has.
Then tell me: are there any services or APIs from other projects that this project
should integrate with? Any shared contracts or event schemas we should know about?
```

#### Copilot

```
@workspace Read context/20-WORKSPACE-PROJECTS.md. What sibling projects exist in
the workspace? What are their bounded contexts? Are there any cross-project
relationships or APIs we should be aware of?
```

---

### 16. Cross-Project Integration

Plan an integration between this project and a sibling project.

#### Codex

```
Read context/20-WORKSPACE-PROJECTS.md for the workspace map.
Read context/30-BOUNDED-CONTEXTS.md for this project's domains.

I need to integrate with the "{{sibling-project}}" project:
- They expose: {{describe API/events/contracts}}
- We need to: {{describe what we consume or publish}}

1. Determine the integration pattern (REST API / Event Bus / Shared Contracts)
2. Create a proposal for the integration: openspec/changes/REQ-{{MVP}}-{{###}}/
3. Update context/20-WORKSPACE-PROJECTS.md Cross-Project Relationships table
4. If consuming an API, add the client to backend/contexts/{{context}}/infrastructure/
5. If publishing events, define the contract in backend/common/contracts/events/
```

#### Claude (Cursor)

```
I need to integrate this project with "{{sibling-project}}".

Read context/20-WORKSPACE-PROJECTS.md to understand both projects.
The integration is: {{describe what needs to happen}}.

Help me:
1. Pick the right integration pattern
2. Create a proposal for it
3. Update the cross-project relationships table
4. Plan the implementation (where does the integration code go?)
```

#### Copilot

```
@workspace Read context/20-WORKSPACE-PROJECTS.md. I need to integrate with
"{{sibling-project}}" which provides {{describe API/service}}. Create a proposal
at openspec/changes/REQ-{{MVP}}-{{###}}/ for this integration. Update the
cross-project relationships in context/20-WORKSPACE-PROJECTS.md.
```

---

### 17. Augment-Enhanced Discovery

> **Only when Augment is enabled** (check `.darkhorse.yaml` → `augment_enabled: true`)

Leverage Augment's codebase indexing for deeper discovery and validation.

#### Augment (Direct)

```
I'm working on this project. Use your codebase index to help me understand:

1. What bounded contexts exist in this project and what are their responsibilities?
2. What APIs do sibling projects in the workspace expose?
3. Are there any architecture violations (cross-context imports, business logic in controllers)?
4. What shared contracts or event schemas exist across the workspace?

Cross-reference your findings with context/20-WORKSPACE-PROJECTS.md and
context/30-BOUNDED-CONTEXTS.md. Flag any discrepancies.
```

#### Codex (with Augment)

```
Read context/00-START-HERE.md and openspec/AGENTS.md.

This project has Augment enabled. Use Augment's codebase index to:
1. Verify that context/20-WORKSPACE-PROJECTS.md is up-to-date with actual workspace projects
2. Search for any cross-context imports that violate DDD boundaries
3. Find all integration points between this project and sibling projects
4. List all event handlers and their corresponding event publishers

Report findings and suggest updates to context/ files if they're stale.
```

#### Claude (Cursor, with Augment)

```
Read context/00-START-HERE.md and openspec/AGENTS.md. This project uses Augment.

Use Augment to search the codebase and answer:
- What services does this project expose to other projects?
- What services does it consume from sibling projects?
- Are there any bounded context boundary violations?
- What patterns are used for cross-project communication?

Then compare with context/20-WORKSPACE-PROJECTS.md and suggest updates.
```

#### Copilot (with Augment)

```
@workspace This project uses Augment for enhanced indexing. Read context/00-START-HERE.md.

Use Augment's cross-repo awareness to find:
1. All REST endpoints exposed by this and sibling projects
2. All event schemas published/consumed across the workspace
3. Any architecture violations in bounded context boundaries
4. Shared contracts that could be reused

Compare with context/20-WORKSPACE-PROJECTS.md and flag any gaps.
```

---

## Quick Reference Card

Copy the right starter for what you're doing:

| Task | Change ID | Start With |
|------|-----------|------------|
| **Onboard** | — | `Read context/00-START-HERE.md and openspec/AGENTS.md` |
| **Discover Workspace** | — | `Read context/20-WORKSPACE-PROJECTS.md` |
| **New Context** | — | `Read context/30-BOUNDED-CONTEXTS.md, create backend/contexts/<name>/` |
| **Plan Feature** | `REQ-X.X-###` | `Read openspec/specs/workflow/planning.md, create openspec/changes/<id>/` |
| **Implement** | `REQ-X.X-###` | `Read openspec/changes/<id>/proposal.md and tasks.md` |
| **Fix Bug** | `BUG-X.X-###` | `Read openspec/specs/workflow/troubleshooting.md, create openspec/changes/<id>/, investigate and fix` |
| **Review Arch** | — | `Read openspec/specs/architecture/, review backend/contexts/<name>/` |
| **Update Maps** | — | `Compare backend/contexts/ with context/30-BOUNDED-CONTEXTS.md` |
| **Cross-Project** | — | `Read context/20-WORKSPACE-PROJECTS.md, create integration proposal` |
| **Augment Discovery** | — | `Use Augment to search codebase and verify context/ files` |
| **New MVP** | — | `Read openspec/specs/workflow/mvp-milestones.md, create mvp-X.X.md` |
| **Archive** | Any | `openspec archive <change-id>` |

---

## Tips by Tool

### Codex Tips

- Codex reads `AGENTS.md` automatically if it's in the repo root or `openspec/`
- Be explicit about file paths — Codex works best with exact locations
- Break large tasks into multiple prompts (plan → implement → test)
- Always include "Read X first" before asking for implementation

### Claude (Cursor) Tips

- Claude can read multiple files in one go — give it the reading list upfront
- Use conversational style: "I need X, check Y first, then do Z"
- Claude is good at architecture decisions — ask "should this be in context A or B?"
- For large features, have Claude create the proposal first, review it, then implement

### Copilot Tips

- Use `@workspace` to give Copilot project-wide context
- For specific files, use `@file:path/to/file.ts` references
- Copilot works great for inline implementation after you've set up the structure
- Use Copilot chat for planning, inline completions for coding

---

## Universal Opener

When starting any session with any tool, this prompt works:

```
Read context/00-START-HERE.md, context/20-WORKSPACE-PROJECTS.md, and openspec/AGENTS.md.
I want to {{describe your goal}}.
Check the relevant specs, workspace projects, and existing proposals before we start.
```

---

*Guide Version: 1.0 | Works with any scaffolded project*


---

## Kiro Prompts

> Use these natural-language instructions with Kiro. Kiro reads `openspec/AGENTS.md` and the `.kiro/steering/` files for context.

### Onboard to the Project
"Read openspec/AGENTS.md and all .kiro/steering/ files to understand this Java project. Summarize the architecture, active bounded contexts, and current MVP status."

### Run Discovery for a Feature
"Run the Discover workflow from openspec/specs/workflow/skills/discovery.md for [feature]. Write the output to openspec/changes/discoveries/."

### Plan a Feature
"Using the discovery at openspec/changes/discoveries/DISC-###.md, run the Plan workflow from openspec/specs/workflow/skills/planning.md and produce a proposal."

### Implement a Proposal
"Implement the approved proposal at openspec/changes/[mvp]/proposal.md. Follow the implementation order: Domain then Application then Infrastructure then Resource then Frontend. Write tests as you go."

### Troubleshoot an Issue
"Troubleshoot [issue description]. Follow openspec/specs/workflow/skills/troubleshooting.md. Do not change code until you have written a bug proposal in openspec/changes/bugs/."

### Architecture Review
"Review the current codebase against the architecture rules in openspec/specs/architecture/. List any violations and suggest corrections following the defined layer structure."

---

## Copilot Prompts

> Use these slash-command prompts in GitHub Copilot Chat.

- `@workspace /discover [feature]`
- `@workspace /plan [feature] based on DISC-###`
- `@workspace /implement proposal from openspec/changes/[mvp]/proposal.md`
- `@workspace /troubleshoot [issue]`
- `@workspace /validate` — check architecture against openspec/specs/architecture/


---

## Kiro Prompts

> Use these natural-language instructions with Kiro.

### Onboard to the Project
"Read openspec/AGENTS.md and all .kiro/steering/ files to understand this Java project. Summarize the architecture, active bounded contexts, and current MVP status."

### Run Discovery for a Feature
"Run the Discover workflow from openspec/specs/workflow/skills/discovery.md for [feature]."

### Plan a Feature
"Using the discovery at openspec/changes/discoveries/DISC-###.md, run the Plan workflow and produce a proposal."

### Implement a Proposal
"Implement the approved proposal at openspec/changes/[mvp]/proposal.md. Domain then Application then Infrastructure then Resource."

---

## Copilot Prompts

- `@workspace /discover [feature]`
- `@workspace /plan [feature] based on DISC-###`
- `@workspace /implement proposal from openspec/changes/[mvp]/proposal.md`
- `@workspace /troubleshoot [issue]`

