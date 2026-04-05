export function renderSettings(): string {
  return `
    <section class="page settings-page">
      <h2>Settings</h2>
      <div class="card">
        <h3>Application Preferences</h3>
        <div class="setting-row">
          <label for="setting-theme">Theme</label>
          <select id="setting-theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="setting-workspace">Default Workspace Path</label>
          <input type="text" id="setting-workspace" placeholder="/path/to/workspace" />
        </div>
        <button id="btn-save-settings" class="btn-primary">Save Settings</button>
      </div>
      <div class="card">
        <h3>Updates</h3>
        <button id="btn-check-updates" class="btn-secondary">Check for Updates</button>
        <p id="settings-update-status"></p>
      </div>
    </section>
  `;
}
