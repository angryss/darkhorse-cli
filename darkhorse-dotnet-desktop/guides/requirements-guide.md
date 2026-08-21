# Requirements Guide — WPF desktop project

Requirements begin as discovery input. They become governed implementation scope only after they are represented in an approved canonical A1 at `.visu/work/<change-id>/contract.yaml`.

## Draft checklist

Capture these facts before Plan:

- the observable problem and desired outcome;
- included and excluded repositories, paths, and interfaces;
- dependencies and assumptions;
- fixed, testable acceptance criteria;
- independently sourced proof expectations;
- risk triggers and rationale;
- reviewers and authority subjects;
- a reversible path to done;
- platform context: bounded contexts, Onion Architecture layers, CQRS, MVVM, persistence, installer, and UI behavior.

This checklist is drafting guidance, not a second plan format. An optional OpenSpec draft flows one way into A1. Once A1 exists, edit only A1 and regenerate proposal/tasks projections.

## Acceptance criteria

Write each criterion as an observable outcome, not an implementation instruction. Include the actor or system state, the action, the expected result, and any boundary or failure behavior. VEP owns proof binding and whether the evidence satisfies the frozen expectation.

## Authority boundaries

- DarkHorse and AI adapters may clarify wording and platform considerations.
- Only project-local VEP validates the contract, proof, review, and close inputs.
- An AI response cannot approve readiness, change risk tier, expand scope, waive proof, or close a change.
- Progress trackers, roadmaps, prompts, and generated projections are non-authoritative views.
- Missing or incompatible project-local VEP fails closed; no global, PATH, source-tree, embedded, or tarball fallback is allowed.
