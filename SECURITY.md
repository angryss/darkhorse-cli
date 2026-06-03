# Security Policy

## Supported Versions

DarkHorse is currently public-alpha/pre-alpha quality. Security fixes should target the latest public source branch and any packages explicitly marked as supported.

## Reporting a Vulnerability

Do not open a public issue for exploitable vulnerabilities, leaked secrets, or private data exposure.

Use the repository's private vulnerability reporting feature when available. If private reporting is not configured yet, contact the maintainers through the project's published maintainer channel before sharing details publicly.

Please include:

- Affected package or path.
- Description of the issue.
- Reproduction steps or proof of concept.
- Potential impact.
- Suggested mitigation, if known.

## Security Expectations

- Do not commit `.env` files, API keys, credentials, private keys, tokens, customer data, or employer-specific confidential material.
- Generated projects should avoid insecure defaults.
- Template changes should be reviewed for secret leakage, filesystem safety, and unsafe network assumptions.
- Dependency and license scanning should be run before public releases.

## Current Known Security Gaps

- Full git history secret scanning has not yet been completed.
- Dependency/license scanning should be added to CI.
- MCP and advanced AI adapter surfaces are experimental unless explicitly documented as implemented.
