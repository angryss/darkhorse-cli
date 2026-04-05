# Command: Run Troubleshooting

Use the **Troubleshooting** skill defined in `openspec/specs/workflow/skills/troubleshooting.md`.

> A Copilot agent for this command lives at `.github/agents/troubleshoot.agent.md`.

## Parameters

- **issue**: Description of the problem or bug
- **mvp**: Target MVP milestone (e.g., 1.0)
- **severity**: Critical / High / Medium / Low
- **context**: Affected bounded context name
- **evidence**: Error messages, logs, or reproduction steps

## Instruction

Read and follow the Troubleshooting skill at `openspec/specs/workflow/skills/troubleshooting.md`.

Load all required context files listed in the skill, then execute all steps in order.

Produce the output in the exact format defined by the skill.

After completing the analysis, suggest proceeding to the **Planning** command to formalize the fix, then **Implementation** to apply it.

## Invocation Template

```
Use the Troubleshooting skill defined in openspec/specs/workflow/skills/troubleshooting.md.

issue: [describe the problem]
mvp: [target milestone]
severity: [Critical/High/Medium/Low]
context: [affected bounded context]
evidence: [error messages, logs, or reproduction steps]

Follow onion architecture and project rules.

Produce:
- Problem summary
- Root cause analysis
- Bug category
- Architecture violation check
- Bug report at openspec/changes/mvp-[MVP]/BUG-[MVP]-[###]/
- Updated openspec/changes/mvp-[MVP]/progress-tracker.md
- Regression test spec
- Next actions (planning → implementation)
```
