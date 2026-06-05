# Deployment Rules

> Mandatory constraints for WiX installer, CI/CD pipelines, and release artifacts.

## Rule 1 — WiX Project Is Part of the Solution

The `deploy/installer/*.wixproj` file MUST be included in the Visual Studio solution.
Agents must not remove it from `*.sln`.

## Rule 2 — Never Change UpgradeCode

`deploy/installer/Variables.wxi` defines `UpgradeCode`.
It MUST NOT change after the first release.
Changing it breaks Windows Installer upgrade detection and leaves orphaned installs.

## Rule 3 — Version in Variables.wxi Only

`ProductVersion` is defined once in `Variables.wxi`.
Never hardcode a version string in `Product.wxs` or `.wixproj`.
CI pipelines inject the version from the git tag.

## Rule 4 — Self-Contained Publish

The installer MUST reference a **self-contained** `dotnet publish` output.
Do not distribute framework-dependent builds that require a pre-installed .NET runtime.

## Rule 5 — Desktop Shortcut Is Optional

The desktop shortcut MUST remain a separate WiX `<Feature>` so users can opt out.
Do not merge it into the main `ProductFeature`.

## Rule 6 — Launch Checkbox Pre-Checked, Not Forced

The "Launch app now" mechanism MUST use `WIXUI_EXITDIALOGOPTIONALCHECKBOX`.
Never force-launch the app at the end of install via a non-optional custom action.

## Rule 7 — Pipeline YAML Is the Source of Truth

All CI/CD pipeline definitions live in the repository.
Do not configure pipelines manually in the CI/CD web UI without updating the YAML file.

## Rule 8 — Icon Before Release

`deploy/installer/assets/app.ico.placeholder` MUST be replaced with a real `app.ico`
before packaging a release MSI. The placeholder file exists to reserve the path.
