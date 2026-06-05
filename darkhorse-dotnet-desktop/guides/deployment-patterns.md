# Deployment Patterns

> WiX 4 MSI installer and CI/CD pipeline patterns for DarkHorse WPF Desktop projects.

## WiX 4 MSI Installer

### Build the Installer

```powershell
# 1. Install WiX 4 toolset (once per machine)
dotnet tool install --global wix --version 4.0.*
wix extension add WixToolset.UI.wixext/4.0.*
wix extension add WixToolset.Util.wixext/4.0.*

# 2. Publish the app (self-contained, Windows x64)
dotnet publish src/<Ns>.Presentation -c Release -r win-x64 --self-contained true

# 3. Build the MSI
dotnet build deploy/installer/<Ns>.Installer.wixproj -c Release -p:Platform=x64
# Output: deploy/installer/bin/Release/<project-name>-setup.msi
```

### Harvesting Additional Files

For self-contained publish outputs with many DLLs, use WiX heat to generate a component group:

```powershell
wix heat dir "src/<Ns>.Presentation/bin/Release/net9.0-windows/win-x64/publish" `
  -o deploy/installer/HarvestedFiles.wxs `
  -cg AppBinaries -dr INSTALLFOLDER `
  -scom -sreg -gg -nologo
```

Then reference `<ComponentGroupRef Id="AppBinaries" />` inside the `<Feature>` in `Product.wxs`.

### Desktop Shortcut

The installer includes a **Desktop Shortcut** as an optional WiX `<Feature>`:
- Shown in the `WixUI_FeatureTree` feature selection page.
- Users can uncheck it before install.
- Defaults to **selected** (Level="1").

### Launch on Finish

The exit dialog includes a **"Launch \<ProductName\> now"** checkbox:
- Implemented via `WIXUI_EXITDIALOGOPTIONALCHECKBOX` with a `WixShellExec` custom action.
- Pre-checked by default (`<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOX" Value="1" />`).
- Only fires on fresh install (condition: `WIXUI_EXITDIALOGOPTIONALCHECKBOX = 1 AND NOT Installed`).

### Versioning

Edit `deploy/installer/Variables.wxi` before each release:
```xml
<?define ProductVersion = "1.2.0" ?>
```

Never change `UpgradeCode` — it is the stable product identity used for upgrade detection.

---

## CI/CD Pipelines

### GitHub Actions

File: `.github/workflows/build-installer.yml`

| Trigger | Action |
|---------|--------|
| Push to `main` | Build + Test |
| Pull request to `main` | Build + Test |
| Tag `v*.*.*` | Build + Test + Publish MSI + Attach to GitHub Release |

Version is injected from the tag name: `v1.2.3` → `ProductVersion = "1.2.3"`.

### Azure DevOps

File: `azure-pipelines.yml`

| Trigger | Action |
|---------|--------|
| Push to `main` | Build + Test |
| Tag `v*.*.*` | Build + Test + Publish MSI artifact |

Connect the pipeline:
1. Commit `azure-pipelines.yml` to the repo root.
2. Azure DevOps → Pipelines → New Pipeline → Azure Repos Git → Existing YAML file.

### Agent-Driven CI/CD Setup

Two options for letting the agent set up the pipeline:

**Option A — MCP Server (recommended):**
```bash
darkhorse-dotnet-desktop mcp-serve
# Then use the "setup_cicd_pipeline" MCP tool in your AI agent session
```

**Option B — PAT + URL (CLI, not yet implemented):**
```bash
darkhorse-dotnet-desktop deploy setup-cicd \
  --provider github-actions \
  --repo https://github.com/org/repo \
  --pat $GITHUB_TOKEN

# For Azure DevOps:
darkhorse-dotnet-desktop deploy setup-cicd \
  --provider ado \
  --org https://dev.azure.com/myorg \
  --project MyProject \
  --pat $ADO_PAT
```

The `deploy setup-cicd` command is scaffolded for future implementation. The generated pipeline YAML files are fully functional — they can be committed manually and will run immediately.

---

## Application Icon

Replace `deploy/installer/assets/app.ico.placeholder` with `app.ico`:
- Multi-size ICO file: 256×256, 48×48, 32×32, 16×16 px
- Generate from a PNG: `magick convert icon.png -define icon:auto-resize=256,48,32,16 app.ico`

---

## Release Checklist

1. [ ] Bump version in `deploy/installer/Variables.wxi`
2. [ ] Replace `app.ico.placeholder` with real `app.ico`
3. [ ] Harvest publish output if new DLLs added (see wix heat above)
4. [ ] `git tag v1.x.y && git push --tags`
5. [ ] CI runs, MSI built and attached to release
