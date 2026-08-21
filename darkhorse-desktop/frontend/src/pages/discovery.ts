export function renderDiscovery(): string {
  return `
    <section class="page discovery-page">
      <h2>Product Discovery</h2>
      <div class="card">
        <h3>Start a Discovery Session</h3>
        <p>Capture non-authoritative observations, options, tradeoffs, and risks as VEP input. Only governed project/VEP state decides whether Discover can move to Plan.</p>
        <form id="discovery-form">
          <label for="discovery-title">Session Title</label>
          <input type="text" id="discovery-title" placeholder="e.g. Core Platform Architecture" />

          <label for="discovery-problem">Problem Statement</label>
          <textarea id="discovery-problem" rows="4" placeholder="What problem are you solving? Who is it for? What does success look like?"></textarea>

          <button type="submit" class="btn-primary">Start Session</button>
        </form>
      </div>
      <div id="discovery-session" class="card hidden">
        <h3>Active Session</h3>
        <div id="session-phase" class="phase-indicator">Local notebook grouping (not lifecycle state)</div>
        <div class="session-controls">
          <button id="btn-add-option" class="btn-secondary">Add Option</button>
          <button id="btn-add-tradeoff" class="btn-secondary">Add Tradeoff</button>
          <button id="btn-add-risk" class="btn-secondary">Add Risk</button>
          <button id="btn-organize-notes" class="btn-secondary">Organize Notes</button>
        </div>
        <div id="session-options"></div>
        <div id="session-tradeoffs"></div>
        <div id="session-risks"></div>
      </div>
      <div id="discovery-readiness" class="card hidden">
        <h3>Governed Readiness Projection</h3>
        <p>No Desktop score or cached decision is authoritative. Refresh through the project-local VEP delegation on the Workspace page.</p>
        <pre id="readiness-projection">No fresh VEP result loaded.</pre>
      </div>
      <div id="discovery-sessions-list" class="card">
        <h3>Previous Sessions</h3>
        <ul id="sessions-list">
          <li class="empty">No discovery sessions yet.</li>
        </ul>
      </div>
    </section>
  `;
}
