export function renderPlanning(): string {
  return `
    <section class="page planning-page">
      <h2>Planning</h2>
      <div class="card">
        <h3>Planning Readiness</h3>
        <p>Select an initiative to check planning readiness and generate planning artifacts.</p>
        <button id="btn-check-readiness" class="btn-primary">Check Readiness</button>
      </div>
      <div class="card">
        <h3>Planning Outputs</h3>
        <ul id="planning-artifacts">
          <li class="empty">No planning artifacts generated yet.</li>
        </ul>
      </div>
    </section>
  `;
}
