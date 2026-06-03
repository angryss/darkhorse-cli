import { invoke } from "../services/tauri";

export function renderDashboard(): string {
  // Trigger async load of initiatives after render
  setTimeout(async () => {
    try {
      const result = await invoke<unknown[]>("list_initiatives");
      const container = document.getElementById("initiative-list");
      if (container && Array.isArray(result)) {
        container.innerHTML =
          result.length > 0
            ? result.map((i: any) => `<li>${i.name || "Unnamed"}</li>`).join("")
            : "<li class='empty'>No initiatives yet. Create one to get started.</li>";
      }
    } catch {
      // Silently handle — dashboard still renders
    }
  }, 0);

  return `
    <section class="page dashboard-page">
      <h2>Dashboard</h2>
      <div class="card">
        <h3>Initiatives</h3>
        <ul id="initiative-list">
          <li class="loading">Loading...</li>
        </ul>
      </div>
      <div class="card-row">
        <div class="card">
          <h3>Quick Actions</h3>
          <button id="btn-new-initiative" class="btn-primary">New Initiative</button>
          <button id="btn-open-workspace" class="btn-secondary">Open Workspace</button>
        </div>
        <div class="card">
          <h3>Status</h3>
          <p>DarkHorse Desktop v0.1.0</p>
          <p id="update-status">Update check pending...</p>
        </div>
      </div>
    </section>
  `;
}
