import { renderDashboard } from "./pages/dashboard";
import { renderDiscovery } from "./pages/discovery";
import { renderPlanning } from "./pages/planning";
import { renderRequirements } from "./pages/requirements";
import { renderRoadmap } from "./pages/roadmap";
import { renderProgress } from "./pages/progress";
import { renderArtifacts } from "./pages/artifacts";
import { renderWorkspace } from "./pages/workspace";
import { renderSettings } from "./pages/settings";

type PageName =
  | "dashboard"
  | "discovery"
  | "planning"
  | "requirements"
  | "roadmap"
  | "progress"
  | "artifacts"
  | "workspace"
  | "settings";

const pages: Record<PageName, () => string> = {
  dashboard: renderDashboard,
  discovery: renderDiscovery,
  planning: renderPlanning,
  requirements: renderRequirements,
  roadmap: renderRoadmap,
  progress: renderProgress,
  artifacts: renderArtifacts,
  workspace: renderWorkspace,
  settings: renderSettings,
};

function navigateTo(page: PageName) {
  const content = document.getElementById("page-content");
  if (!content) return;
  content.innerHTML = pages[page]();

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === page);
  });
}

// Wire up navigation
document.querySelectorAll<HTMLButtonElement>(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.getAttribute("data-page") as PageName;
    if (page) navigateTo(page);
  });
});

// Initial render
navigateTo("dashboard");
