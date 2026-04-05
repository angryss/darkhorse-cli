# Command: Run Troubleshooting

Use the **Troubleshooting** skill defined in `workflows/skills/troubleshooting.md`.

## Parameters

- **issue**: Description of the problem or bug
- **severity**: Critical / High / Medium / Low
- **context**: Affected bounded context name
- **evidence**: Error messages, logs, or reproduction steps

## Instruction

Read and follow the Troubleshooting skill at `workflows/skills/troubleshooting.md`.

Load all required context files listed in the skill, then execute all steps in order.

Produce the output in the exact format defined by the skill.

After completing the analysis, suggest proceeding to the **Planning** command to formalize the fix, then **Implementation** to apply it.

## Invocation Template

```
Use the Troubleshooting skill defined in workflows/skills/troubleshooting.md.

issue: [describe the problem]
severity: [Critical/High/Medium/Low]
context: [affected bounded context]
evidence: [error messages, logs, or reproduction steps]

Follow onion architecture and project rules.

Produce:
- Problem summary
- Root cause analysis
- Bug category
- Architecture violation check
- Recommended fix
- Regression test spec
- Next actions (planning → implementation)
```
