export function renderRoadmap(): string {
  return `
    <section class="page roadmap-page">
      <h2>Roadmap</h2>
      <div class="card">
        <h3>Milestones</h3>
        <p>Track delivery milestones and progress for your initiative.</p>
        <button id="btn-add-milestone" class="btn-primary">Add Milestone</button>
      </div>
      <div id="roadmap-milestones" class="card">
        <ul>
          <li class="empty">No milestones defined yet.</li>
        </ul>
      </div>
    </section>
  `;
}
