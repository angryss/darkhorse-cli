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

## Forbidden By Default

- Agent frameworks such as LangChain, AutoGen, CrewAI, Semantic Kernel, or any derivatives
- Vector DB / embeddings / RAG infrastructure, hosted or local
- Agent runtime dependencies (package.json, requirements.txt, pyproject, etc.) that install AI agent runners
- Extra agent configuration folders or files beyond `.github/agents/` and `.github/prompts/`
- Custom MCP servers unless explicitly approved via OpenSpec change request
- Any "helper" service that provisions new AI agents or chains outside Copilot/Claude/Codex

If a template includes any of the above, remove it before scaffolding completes.

## Project Structure Guardrail

Scaffolding may ONLY create the agreed structure:

- `context/` — AI navigation files
- `openspec/` — specifications, proposals, archive
- `backend/` — application code
- `frontend/` — frontend code (when enabled)
- `deployment/` — infrastructure and deployment
- `.github/agents/` — Copilot custom agents
- `.github/prompts/` — prompt commands (Copilot + Claude)
- `.github/copilot-instructions.md` — workspace-level Copilot/Claude instructions
- `.vscode/` — optional, minimal recommended settings

No additional AI directories, prompt folders, or configuration artifacts are allowed.

## Exception Process

Any exception requires a formal OpenSpec change request (REQ). Document the need, proposed tooling, and risk analysis in the proposal, then wait for approval before adding files or dependencies. Until such approval exists, follow this rule exactly.
