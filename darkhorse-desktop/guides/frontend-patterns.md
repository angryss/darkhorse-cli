# Frontend Patterns Guide

**Architecture and implementation patterns for Tauri desktop frontend development.**

---

## Platform: Tauri 2 Desktop

| Aspect | Choice |
|--------|--------|
| **Framework** | Vanilla TypeScript (no React/Vue/Angular) |
| **Bundler** | Vite 6 |
| **Language** | TypeScript 5.5+ (strict mode) |
| **IPC** | @tauri-apps/api invoke() for Rust ↔ Frontend communication |
| **Styling** | CSS custom properties (design tokens), no CSS framework |

---

## Project Structure

```
frontend/
├── index.html                  # App shell with nav + content mount
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts                 # Router, page mount, nav event binding
    ├── services/
    │   └── tauri.ts            # Typed invoke() wrapper with dev-mock fallback
    ├── pages/                  # Page-level render functions
    │   ├── dashboard.ts
    │   ├── discovery.ts
    │   ├── planning.ts
    │   └── settings.ts
    ├── components/             # Reusable UI components (ready for expansion)
    ├── stores/                 # Client-side state (ready for expansion)
    └── styles/
        └── main.css            # Global styles with CSS custom properties
```

---

## Page Pattern

Each page is a module that exports a `render` function returning an HTML string.

```typescript
import { invoke } from "../services/tauri";

export function renderDashboard(): string {
  // Trigger async load after render
  setTimeout(async () => {
    try {
      const result = await invoke<unknown[]>("list_projects");
      const container = document.getElementById("project-list");
      if (container && Array.isArray(result)) {
        container.innerHTML = result.length > 0
          ? result.map((p: any) => `<li>${p.name}</li>`).join("")
          : "<li class='empty'>No projects yet.</li>";
      }
    } catch {
      // Silently handle — page still renders
    }
  }, 0);

  return `
    <section class="page dashboard-page">
      <h2>Dashboard</h2>
      <ul id="project-list">
        <li class="loading">Loading...</li>
      </ul>
    </section>
  `;
}
```

---

## Router Pattern

```typescript
import { renderDashboard } from "./pages/dashboard";
import { renderSettings } from "./pages/settings";

type PageRenderer = () => string;

const routes: Record<string, PageRenderer> = {
  dashboard: renderDashboard,
  settings: renderSettings,
};

function navigate(page: string) {
  const renderer = routes[page] ?? routes.dashboard;
  const main = document.querySelector(".app-main");
  if (main) main.innerHTML = renderer();

  // Update active nav state
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === page);
  });
}
```

---

## Tauri IPC Service

```typescript
export async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (window.__TAURI_INTERNALS__) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(command, args);
  }
  // Dev fallback when running outside Tauri
  console.warn(`[dev-mock] invoke("${command}")`, args);
  return {} as T;
}
```

---

## Styling: CSS Custom Properties

```css
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --bg-card: #222639;
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --accent: #6c8cff;
  --accent-hover: #8ca8ff;
  --border: #2e3347;
  --danger: #ff6b6b;
  --success: #51cf66;
  --radius: 8px;
  --font: "Segoe UI", system-ui, sans-serif;
}
```

All colors, spacing, and typography reference CSS custom properties. Components never use hardcoded color values.

---

## Component Pattern

For reusable UI, export factory functions:

```typescript
export function createButton(label: string, variant: "primary" | "secondary" = "primary"): string {
  return `<button class="btn-${variant}">${label}</button>`;
}

export function createCard(title: string, content: string): string {
  return `
    <div class="card">
      <h3>${title}</h3>
      ${content}
    </div>
  `;
}
```

---

## State Management

For page-local state, use module-scoped variables. For cross-page state, use a simple store:

```typescript
type Listener = () => void;

function createStore<T>(initial: T) {
  let state = initial;
  const listeners: Listener[] = [];

  return {
    get: () => state,
    set: (next: T) => { state = next; listeners.forEach((l) => l()); },
    subscribe: (fn: Listener) => { listeners.push(fn); },
  };
}

export const projectStore = createStore<{ id: string; name: string } | null>(null);
```

---

## Testing

Frontend tests use Vitest:

```typescript
import { describe, it, expect } from "vitest";
import { renderDashboard } from "../src/pages/dashboard";

describe("Dashboard", () => {
  it("renders project list container", () => {
    const html = renderDashboard();
    expect(html).toContain("project-list");
  });
});
```

---

*Guide Version: 1.0 — Tauri 2 + Vanilla TypeScript*
