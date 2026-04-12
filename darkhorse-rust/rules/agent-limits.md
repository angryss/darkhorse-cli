# Agent Limits Rule (v2.0)

Mandatory rule: scaffolding and automation must not create agent sprawl or pull in unapproved AI tooling. All AI interaction follows the three-layer agentic workflow.

## Approved AI Tools

- **GitHub Copilot** — primary IDE assistant, custom agents (`@agent-name`), prompt commands (`/command-name`)
- **Claude** — conversational AI, prompt commands, project-level instructions
- **Codex** — code generation and completion

Only these assistants may be referenced in scaffolding instructions, readmes, or generated files.

## Agentic Workflow (Mandatory)

All AI-assisted development follows the **Agent → Command → Skill** chain:

| Layer | Location | Format | Purpose |
|-------|----------|--------|---------|
| **Agents** | `.github/agents/*.agent.md` | Copilot custom agents | Behavioral rules, interaction style, hard constraints |
| **Commands** | `.github/prompts/*.prompt.md` | Prompt files (Copilot + Claude) | Structured invocation with parameters |
| **Skills** | `openspec/specs/workflow/skills/*.md` | Detailed specifications | Step-by-step execution, context loading, output format |

### Rules

1. Agents MUST delegate to commands. Agents MUST NOT execute skills directly.
2. Commands MUST reference skills. Commands MUST NOT contain inline workflow logic.
3. Skills are the single source of truth for workflow execution.
4. New workflows require all three layers (agent + command + skill).
5. Do not create ad-hoc prompts, agent files, or workflow specs outside this structure.

## Hard Rules

1. **Read context first**: Always start with `context/00-START-HERE.md` and `openspec/AGENTS.md` before making changes.
2. **Respect layer boundaries**: Never add dependencies from inner crates to outer crates.
3. **No infrastructure in domain**: The domain crate must never import rusqlite, tokio, tauri, or any I/O library.
4. **Implement inside-out**: Domain → Application → Infrastructure → Desktop → Frontend.
5. **Proposals before code**: Non-trivial changes require an approved proposal in `openspec/changes/`.
6. **Update progress**: After implementing a requirement, update the progress tracker.

## What Agents May Do

- Read all project files and context documents
- Create and modify Rust source files following architecture rules
- Create and modify TypeScript frontend files
- Add dependencies in the correct crate's `Cargo.toml`
- Create proposals in `openspec/changes/`
- Update `openspec/specs/domain/` with new context definitions

## What Agents Must NOT Do

- Add runtime dependencies to the domain crate (beyond serde, chrono, uuid, thiserror)
- Create Tauri commands that contain business logic
- Bypass the port-adapter pattern (no direct infrastructure calls from application)
- Modify `crates/<prefix>-desktop/tauri.conf.json` without explicit request
- Delete or restructure the crate layout
- Remove or ignore architecture rules in `openspec/specs/architecture/`

## Forbidden By Default

- Agent frameworks such as LangChain, AutoGen, CrewAI, Semantic Kernel, or any derivatives
- Vector DB / embeddings / RAG infrastructure, hosted or local
- Agent runtime dependencies that install AI agent runners
- Extra agent configuration folders or files beyond `.github/agents/` and `.github/prompts/`
- Custom MCP servers unless explicitly approved via OpenSpec change request
- Any "helper" service that provisions new AI agents or chains outside Copilot/Claude/Codex

## Project Structure Guardrail

Scaffolding may ONLY create the agreed structure:

- `context/` — AI navigation files
- `openspec/` — specifications, proposals, archive
- `crates/` — Rust workspace crates
- `frontend/` — frontend code (when enabled)
- `deployment/` — infrastructure and deployment
- `.github/agents/` — Copilot custom agents
- `.github/prompts/` — prompt commands (Copilot + Claude)
- `.github/copilot-instructions.md` — workspace-level Copilot/Claude instructions
- `.vscode/` — optional, minimal recommended settings

No additional AI directories, prompt folders, or configuration artifacts are allowed.

## Exception Process

Any exception requires a formal OpenSpec change request (REQ). Document the need, proposed tooling, and risk analysis in the proposal, then wait for approval before adding files or dependencies.
