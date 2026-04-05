export function renderProgress(): string {
  return `
    <section class="page progress-page">
      <h2>Delivery Progress</h2>
      <div class="card">
        <h3>Implementation Slices</h3>
        <p>Track the status of implementation slices derived from your MVP requirements.</p>
        <div class="progress-overview">
          <div class="stat-box">
            <span class="stat-value" id="slices-total">0</span>
            <span class="stat-label">Total Slices</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="slices-completed">0</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="slices-blocked">0</span>
            <span class="stat-label">Blocked</span>
          </div>
        </div>
      </div>
      <div id="progress-entries" class="card">
        <h3>Recent Activity</h3>
        <ul>
          <li class="empty">No progress entries recorded yet.</li>
        </ul>
      </div>
    </section>
  `;
}
