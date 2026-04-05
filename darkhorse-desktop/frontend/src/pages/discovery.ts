export function renderDiscovery(): string {
  return `
    <section class="page discovery-page">
      <h2>Product Discovery</h2>
      <div class="card">
        <h3>Start a Discovery Session</h3>
        <p>Discovery sessions help you explore a product idea, compare options, identify tradeoffs and risks, and converge on a direction before formal planning.</p>
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
        <div id="session-phase" class="phase-indicator"></div>
        <div class="session-controls">
          <button id="btn-add-option" class="btn-secondary">Add Option</button>
          <button id="btn-add-tradeoff" class="btn-secondary">Add Tradeoff</button>
          <button id="btn-add-risk" class="btn-secondary">Add Risk</button>
          <button id="btn-advance-phase" class="btn-primary">Advance Phase</button>
        </div>
        <div id="session-options"></div>
        <div id="session-tradeoffs"></div>
        <div id="session-risks"></div>
      </div>
      <div id="discovery-readiness" class="card hidden">
        <h3>Planning Readiness</h3>
        <div id="readiness-score"></div>
        <div id="readiness-blockers"></div>
        <button id="btn-check-readiness" class="btn-secondary">Check Readiness</button>
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
