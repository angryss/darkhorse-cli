# Agent Limits Rule (v1.1)

Mandatory rule: scaffolding and automation must not create agent sprawl or pull in unapproved AI tooling.

## Approved AI Tools
- GitHub Copilot
- Claude
- Codex
- **Augment** _(optional — enabled during scaffolding via `--augment`)_

Only these assistants may be referenced in scaffolding instructions, readmes, or generated files.

### Augment (Optional Enhancement)

Augment is an **optional** AI tool that provides enhanced codebase indexing and cross-repo awareness. When Augment is included in a project:

| Capability | How It Helps |
|------------|-------------|
| **Codebase Indexing** | Agents query Augment's index for precise code references instead of manual file searching |
| **Cross-Repo Awareness** | Augment sees across workspace repos, enabling discovery of APIs, events, and contracts in sibling projects |
| **Architecture Validation** | Agents ask Augment to verify bounded context boundaries and import rules |
| **Live Code Intelligence** | Augment's index auto-updates — always reflects current codebase state |

**Augment + `context/` are complementary:**
- `context/` provides structured, human-curated project maps and relationships
- Augment provides live, indexed code intelligence
- Both are used together — `context/` for orientation, Augment for precision

**Scaffolding choice:** During `darkhorse-java init`, the user is asked whether to include Augment. The choice is stored in `.darkhorse.yaml` and controls which sections appear in `AGENTS.md`.

## Forbidden By Default
- Agent frameworks such as LangChain, AutoGen, CrewAI, Semantic Kernel, or any derivatives
- Vector DB / embeddings / RAG infrastructure, hosted or local
- Agent runtime dependencies (package.json, requirements.txt, pyproject, etc.) that install AI agent runners
- Extra agent configuration folders or files (`agents/`, `prompts/agents/`, `tools/agents/`, `agent-config/`, etc.)
- Any "helper" service that provisions new AI agents or chains outside Copilot/Claude/Codex

If a template includes any of the above, remove it before scaffolding completes.

## Project Structure Guardrail
Scaffolding may ONLY create the agreed structure:
- `context/`
- `openspec/`
- `backend/`
- `frontend/`
- `deployment/`
- Optional `.vscode/` folder containing the minimal recommended settings shipped with the template

No additional AI directories, prompts, or config artifacts are allowed.

## Exception Process
Any exception requires a formal OpenSpec change request (REQ). Document the need, proposed tooling, and risk analysis in the proposal, then wait for approval before adding files or dependencies. Until such approval exists, follow this rule exactly.
