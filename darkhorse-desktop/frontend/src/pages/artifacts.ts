export function renderArtifacts(): string {
  return `
    <section class="page artifacts-page">
      <h2>Artifacts</h2>
      <div class="card">
        <h3>Generated Artifacts</h3>
        <p>View and manage all artifacts generated throughout the Dark Horse workflow — discovery outputs, planning documents, requirements specs, and more.</p>
        <button id="btn-export-artifact" class="btn-primary">Export New Artifact</button>
        <button id="btn-refresh-artifacts" class="btn-secondary">Refresh List</button>
      </div>
      <div id="artifact-list" class="card">
        <h3>Workspace Artifacts</h3>
        <table class="artifact-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody id="artifact-table-body">
            <tr><td colspan="3" class="empty">No artifacts generated yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}
