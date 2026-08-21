export function renderPlanning(): string {
  return `
    <section class="page planning-page">
      <h2>Planning</h2>
      <div class="card">
        <h3>VEP Plan</h3>
        <p>Desktop may collect draft observations. Invoke the governed Plan operation from Workspace; VEP owns readiness and transition truth.</p>
      </div>
      <div class="card">
        <h3>Read-only A1 Projections</h3>
        <p>After A1 exists, <code>.visu/work/&lt;change-id&gt;/contract.yaml</code> is the sole editable plan authority. Amend A1 through the adapter and regenerate projections.</p>
        <ul id="planning-artifacts">
          <li class="empty">No planning artifacts generated yet.</li>
        </ul>
      </div>
    </section>
  `;
}
