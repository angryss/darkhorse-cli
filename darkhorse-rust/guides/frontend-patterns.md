# Frontend Patterns — Rust/Tauri Desktop

> Frontend patterns for TypeScript UI in Dark Horse Tauri desktop projects.

## Tech Stack

- **Bundler**: Vite
- **Language**: TypeScript (vanilla — no framework by default)
- **Communication**: Tauri IPC via `@tauri-apps/api`

## Directory Structure

```
frontend/
├── src/
│   ├── main.ts           ← Entry point
│   ├── pages/             ← Feature-area pages
│   ├── services/          ← Tauri IPC wrappers
│   ├── stores/            ← Client-side state
│   ├── components/        ← Reusable UI components
│   └── styles/            ← CSS / design tokens
├── public/                ← Static assets
├── index.html             ← App shell
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Service Layer (Tauri IPC)

All Tauri communication goes through typed service modules. Never call `invoke()` directly from page code.

```typescript
// services/project-service.ts
import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

export async function createProject(name: string, description: string): Promise<string> {
  return invoke<string>("create_project", { name, description });
}

export async function listProjects(): Promise<Project[]> {
  return invoke<Project[]>("list_projects");
}
```

## Page Pattern

Pages are self-contained feature areas:

```typescript
// pages/projects.ts
import { listProjects, createProject } from "../services/project-service";

export async function renderProjectsPage(container: HTMLElement): Promise<void> {
  const projects = await listProjects();
  container.innerHTML = `
    <h2>Projects</h2>
    <ul>${projects.map(p => `<li>${p.name}</li>`).join("")}</ul>
  `;
}
```

## State Management

For simple apps, use plain TypeScript objects:

```typescript
// stores/app-store.ts
interface AppState {
  currentPage: string;
  sidebarOpen: boolean;
}

const state: AppState = {
  currentPage: "dashboard",
  sidebarOpen: true,
};

export function getState(): Readonly<AppState> {
  return state;
}

export function navigate(page: string): void {
  state.currentPage = page;
  // Re-render as needed
}
```

For complex apps, consider a reactive store library.

## Tauri Plugin Usage

```typescript
// Dialog
import { open, save } from "@tauri-apps/plugin-dialog";

const selected = await open({ multiple: false, filters: [{ name: "JSON", extensions: ["json"] }] });

// Filesystem
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const content = await readTextFile(filePath);
await writeTextFile(filePath, JSON.stringify(data));
```

## Design Guidelines

- Keep the frontend lightweight. Heavy logic belongs in Rust.
- Use semantic HTML. Avoid framework-level abstractions unless needed.
- Style with plain CSS or a minimal design token system.
- All async errors from Tauri should be caught and displayed to the user.
