# Prompt Starters — Rust/Tauri Desktop

> Example prompts for AI agents working on Dark Horse Rust/Tauri projects.

## Discovery

- "Analyze the current project structure and identify what bounded contexts we need."
- "Review the domain model and suggest missing entities or value objects."
- "What Tauri plugins would benefit this project?"

## Planning

- "Create a proposal for REQ-1.0-001: [describe feature]."
- "Plan the domain model for the [context name] bounded context."
- "Design the SQLite schema for [feature area]."
- "Plan the Tauri command interface for [feature area]."

## Implementation

- "Implement REQ-1.0-001 following the approved proposal."
- "Add a new entity `[Name]` to the domain crate with proper value objects."
- "Create the port trait and SQLite repository for `[Entity]`."
- "Add a Tauri command for `[action]` that dispatches to the application layer."
- "Create the frontend page for `[feature]` with proper service layer calls."

## Troubleshooting

- "Why is `cargo check` failing with a dependency cycle error?"
- "The Tauri command returns an error — trace it through all layers."
- "SQLite migration is failing — diagnose and fix."
- "The frontend can't reach the Tauri backend — check IPC configuration."

## Architecture Review

- "Verify that the domain crate has no infrastructure dependencies."
- "Check that all Tauri commands are thin wrappers dispatching to the application layer."
- "Review the port trait definitions for completeness."
- "Ensure all bounded contexts are properly isolated."
