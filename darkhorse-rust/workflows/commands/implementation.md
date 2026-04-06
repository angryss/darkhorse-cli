# Implementation Command

> Execute an approved implementation proposal.

## Usage

```bash
darkhorse-rust implement
```

## What It Does

Launches implementation using the Implement agent. The agent:

1. Loads the approved proposal
2. Implements inside-out: Domain → Application → Infrastructure → Desktop → Frontend
3. Writes tests at each layer
4. Updates the progress tracker

## Skill Reference

See `openspec/specs/workflow/skills/implementation.md` for the full implementation skill specification.
