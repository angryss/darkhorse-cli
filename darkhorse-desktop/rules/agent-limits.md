# Agent Limits Rule (v1.0)

> Agents cannot authorize VEP lifecycle, readiness, risk tier, proof, review, or Close. Use the project-local VEP through the installed Darkhorse CLI; preserve nonzero/fail-closed results.

Mandatory rule: project setup and automation must not create agent sprawl or pull in unapproved AI tooling.

## Approved AI Tools
- GitHub Copilot
- Claude
- Codex

Only these assistants may be referenced in project instructions, readmes, or workflow files.

## Forbidden By Default
- Agent frameworks such as LangChain, AutoGen, CrewAI, Semantic Kernel, or any derivatives
- Vector DB / embeddings / RAG infrastructure, hosted or local
- Agent runtime dependencies (package.json, requirements.txt, Cargo.toml) that install AI agent runners
- Extra agent configuration folders or files (`agents/`, `prompts/agents/`, `tools/agents/`, `agent-config/`, etc.)
- Any "helper" service that provisions new AI agents or chains outside Copilot/Claude/Codex

If any file includes the above, remove it before merging.

## Project Structure Guardrail
The project may ONLY contain the agreed structure:
- `context/`
- `openspec/`
- `crates/`
- `frontend/`
- `deployment/`
- Optional `.vscode/` folder containing the minimal recommended settings shipped with the template

No additional AI directories, prompts, or config artifacts are allowed.

## Exception Process
Any exception requires a formal OpenSpec change request (REQ). Document the need, proposed tooling, and risk analysis in the proposal, then wait for approval before adding files or dependencies. Until such approval exists, follow this rule exactly.
