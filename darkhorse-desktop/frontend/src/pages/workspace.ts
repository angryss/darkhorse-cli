export function renderWorkspace(): string {
  return `
    <section class="page workspace-page">
      <h2>Workspace</h2>
      <div class="card">
        <h3>Current Workspace</h3>
        <p id="workspace-name">No workspace selected.</p>
        <p id="workspace-path" class="text-muted"></p>
        <div class="btn-row">
          <button id="btn-create-workspace" class="btn-primary">Create Workspace</button>
          <button id="btn-load-workspace" class="btn-secondary">Load Workspace</button>
        </div>
      </div>
      <div id="workspace-summary" class="card hidden">
        <h3>Workspace Summary</h3>
        <div class="summary-grid">
          <div class="stat-box">
            <span class="stat-value" id="ws-initiative-count">0</span>
            <span class="stat-label">Initiatives</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="ws-session-count">0</span>
            <span class="stat-label">Discovery Sessions</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="ws-artifact-count">0</span>
            <span class="stat-label">Artifacts</span>
          </div>
        </div>
      </div>
      <div id="workspace-list" class="card">
        <h3>Recent Workspaces</h3>
        <ul id="recent-workspaces">
          <li class="empty">No workspaces created yet.</li>
        </ul>
      </div>
    </section>
  `;
}
