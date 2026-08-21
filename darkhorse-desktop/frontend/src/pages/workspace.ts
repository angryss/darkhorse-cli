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
      <div class="card">
        <h3>Governed Developer Lifecycle</h3>
        <p><strong>Discover â†’ Plan â†’ Implement â†’ Test â†’ Close</strong></p>
        <p>Review is a Test operation. Every action delegates to an installed Darkhorse CLI, which resolves only the generated project's local VEP. There is no global, source-tree, tarball, cached-state, or legacy Desktop fallback.</p>
        <form id="vep-delegation-form">
          <label for="vep-project-root">Generated project root</label>
          <input id="vep-project-root" required placeholder="Absolute path containing package.json" />
          <label for="vep-delegate-program">Darkhorse delegate runtime</label>
          <input id="vep-delegate-program" required placeholder="Absolute installed darkhorse executable, or node executable" />
          <label for="vep-delegate-entry">Darkhorse CLI entrypoint (required when runtime is node)</label>
          <input id="vep-delegate-entry" placeholder="Absolute .../darkhorse-*/dist/index.js" />
          <label for="vep-action">Operation</label>
          <select id="vep-action">
            <option value="discover">Discover</option><option value="plan">Plan</option>
            <option value="implement">Implement boundary</option><option value="test">Test</option>
            <option value="review">Test / Review</option><option value="close">Close</option>
          </select>
          <label for="vep-arguments">Arguments (JSON string array; include --json for a derived JSON projection)</label>
          <textarea id="vep-arguments" rows="3">["--json"]</textarea>
          <button type="submit" class="btn-primary">Invoke governed operation</button>
        </form>
        <pre id="vep-result">No fresh governed result.</pre>
      </div>
    </section>
  `;
}
