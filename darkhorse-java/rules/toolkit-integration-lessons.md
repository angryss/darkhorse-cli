# Toolkit Integration — Lessons Learned

> Applies to: `@react-toolkit/*` packages consumed from a local toolkit source (e.g. `frontend/toolkit/packages/`) via `file:` dependencies.

---

## 1. Vendoring Required for Docker Builds

**Problem:** `file:../toolkit/...` (or other local-path) dependencies in `package.json` are outside the Docker build context (`frontend/web-app/`). Docker cannot resolve them at image build time.

**Solution:** Vendor the packages under `frontend/web-app/vendor/<package-name>/` with relative `file:./vendor/<package-name>` references.

**Steps when adding a new toolkit package:**
1. Create `frontend/web-app/vendor/<pkg>/` with a stripped `package.json` (peer deps only — remove all `workspace:*` internal deps).
2. Copy `dist/` from the toolkit source into `vendor/<pkg>/dist/`.
3. Copy any CSS module files from `src/` into `vendor/<pkg>/dist/` (see §2 below).
4. Update `package.json` dep to `"file:./vendor/<pkg>"`.
5. Add `COPY vendor/ ./vendor/` in `Dockerfile` **before** `RUN npm ci`.
6. Reinstall: `npm install`.

---

## 2. CSS Module Files Are Not Emitted to `dist/`

**Problem:** The toolkit TypeScript build (`tsc`) does not copy `.module.css` files into `dist/`. The compiled JS files still reference them via `import styles from './ComponentName.module.css'`. Vite/Rollup fails at bundle time with `Could not resolve "./ComponentName.module.css"`.

**Solution:** Manually copy the CSS module file from `src/` to `dist/` in the vendor folder.

```powershell
Copy-Item "frontend\\toolkit\\packages\\<pkg>\\src\\*.module.css" `
          "frontend\\web-app\\vendor\\<pkg>\\dist\\"
```

**Checklist per toolkit package:**
- `@react-toolkit/kanban` → copy `src/KanbanBoard.module.css` → `vendor/kanban/dist/`
- `@react-toolkit/gantt`  → copy `src/GanttChart.module.css`  → `vendor/gantt/dist/`

---

## 3. Design Tokens Have No CSS Entry Point

**Problem:** The CSS modules import `@import '@react-toolkit/design-tokens'` as if it were a CSS file. The `@react-toolkit/design-tokens` package is JS-only (exports TypeScript constants). The CSS bundler cannot resolve a CSS `@import` to a JS-only package.

**Solution:** Remove the `@import` and replace it with an inline `:root { }` block of CSS custom properties in the vendored CSS file.

```css
/* Replace: @import '@react-toolkit/design-tokens'; */
:root {
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  /* ... full token set ... */
}
```

The full token set is defined in both `vendor/kanban/dist/KanbanBoard.module.css` and `vendor/gantt/dist/GanttChart.module.css`.

---

## 4. `npm pack` Does Not Work for Toolkit Packages

**Problem:** Using `npm pack` to create tarballs of toolkit packages fails because their `package.json` contains `workspace:*` protocol dependencies that npm rejects outside the monorepo workspace.

**Do not use:** `npm pack ./frontend/toolkit/packages/<pkg>`

**Use instead:** The manual vendor copy approach described in §1.

---

## 5. `tsconfig` Strict Mode Catches Unused Imports in Test Files

**Problem:** `npm run build` runs `tsc && vite build`. The `tsc` step respects `"noUnusedLocals": true` (or `strict: true` equivalent). Test file imports that pass Vitest do NOT necessarily pass `tsc`.

**Observed violations:**
- Vitest globals (`beforeEach`, `fireEvent`, `describe`) imported but not used
- Type imports used only as type annotations without `import type`
- Catch parameter `(e)` in `.catch(e => {})` when `e` is never referenced

**Rule:** Always import from `'vitest'` explicitly — do not rely on globals. Remove any import that the component or test does not actively use.

---

## 6. Mock Object Shape Must Match Full Interface

**Problem:** Zustand store mock objects in tests must include **all** fields defined in the store's `State` interface. TypeScript's `tsc` (build mode) is stricter than Vitest's runtime type checking.

**Example:** `mockBoard` missing `workspaceId` and `createdAt` from the `Board` interface caused a `TS2345` error only visible during `npm run build`, not during `npm run test`.

**Rule:** When creating mock objects for typed interfaces, include every required field — even those not directly used in the specific test.

---

## 7. Dark Mode: CSS Modules Scopes Class Selectors — Use Attribute Selectors Instead

**Problem:** Adding a dark mode override block using `.chakra-ui-dark { }` inside a `.module.css` file has no effect. CSS Modules transforms all class selectors into unique scoped identifiers at build time, so `.chakra-ui-dark` becomes something like `._chakra-ui-dark_abc12` and never matches the global class Chakra UI adds to `<html>`.

**First failed attempt:**
```css
/* DOES NOT WORK in .module.css */
.chakra-ui-dark {
  --color-white: #1a202c;
}
```

**Root cause:** Attribute selectors (`[attr="value"]`) are **never** transformed by CSS Modules — they pass through as-is and match global DOM attributes directly.

**Solution:** Use `[data-theme="dark"]` — Chakra UI v2 sets `data-theme="dark"` on `<html>` when dark mode is active.

```css
/* WORKS — attribute selector is not scoped by CSS Modules */
[data-theme="dark"] {
  --color-white: #1a202c;
  --color-gray-50: #171923;
  /* ... */
}
```

**Rule:** Any global selector (theme class, dark mode, `:root` overrides) inside a `.module.css` file **must** use an attribute selector or `:root` pseudoclass. Never use a class selector to target an element outside the component's own DOM subtree.

**Applies to:** `vendor/kanban/dist/KanbanBoard.module.css`, `vendor/gantt/dist/GanttChart.module.css`, and any future toolkit package CSS modules.
