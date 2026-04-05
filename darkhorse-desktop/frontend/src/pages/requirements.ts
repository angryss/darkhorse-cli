export function renderRequirements(): string {
  return `
    <section class="page requirements-page">
      <h2>Requirements</h2>
      <div class="card">
        <h3>MVP Requirements</h3>
        <p>Define and manage requirements for your MVP scope.</p>
        <button id="btn-add-requirement" class="btn-primary">Add Requirement</button>
      </div>
      <div id="requirements-list" class="card">
        <h3>Current Requirements</h3>
        <ul>
          <li class="empty">No requirements defined yet.</li>
        </ul>
      </div>
    </section>
  `;
}
