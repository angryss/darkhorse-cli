import { renderDashboard } from "./pages/dashboard";
import { renderDiscovery } from "./pages/discovery";
import { renderPlanning } from "./pages/planning";
import { renderRequirements } from "./pages/requirements";
import { renderRoadmap } from "./pages/roadmap";
import { renderProgress } from "./pages/progress";
import { renderArtifacts } from "./pages/artifacts";
import { renderWorkspace } from "./pages/workspace";
import { renderSettings } from "./pages/settings";
import { invoke, type VepAction, type VepDelegationResult } from "./services/tauri";

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
  if (page === "workspace") wireVepDelegation();

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === page);
  });
}

function wireVepDelegation() {
  const form = document.getElementById("vep-delegation-form") as HTMLFormElement | null;
  const result = document.getElementById("vep-result");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!result) return;
    const value = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
    try {
      const parsedArguments = JSON.parse(value("vep-arguments")) as unknown;
      if (!Array.isArray(parsedArguments) || !parsedArguments.every((item) => typeof item === "string")) {
        throw new Error("Arguments must be a JSON string array.");
      }
      const entry = value("vep-delegate-entry");
      const response = await invoke<VepDelegationResult>("invoke_project_vep", {
        input: {
          projectRoot: value("vep-project-root"),
          delegateProgram: value("vep-delegate-program"),
          delegatePrefixArguments: entry ? [entry] : [],
          action: value("vep-action") as VepAction,
          arguments: parsedArguments,
          requireJson: parsedArguments.includes("--json"),
        },
      });
      result.textContent = JSON.stringify(response, null, 2);
      result.dataset.exitCode = String(response.exitCode);
    } catch (error) {
      result.textContent = `FAIL_CLOSED\n${String(error)}\nRecovery: correct the displayed path/input or repair the installed Darkhorse CLI and project-local VEP; no legacy fallback was used.`;
      result.dataset.exitCode = "1";
    }
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
