# Lighthouse CI and CodeQL

This repository uses two GitHub automation checks for production readiness.

## Lighthouse CI

Lighthouse CI runs a real browser audit against:

```text
https://gigworlds.net
```

It checks performance, accessibility, best practices, and SEO signals. The current workflow is intentionally warning-based because it audits a live external website. Live network, hosting, CDN, third-party script variance, and existing production issues can change scores between runs.

Run locally:

```powershell
npm install
npm run lighthouse
```

Reports are written to:

```text
lhci-reports/
```

Local runs require Chrome. The GitHub workflow installs stable Chrome explicitly before running Lighthouse CI.
The Chrome setup action is pinned to a commit SHA because it is a third-party GitHub Action.

The GitHub workflow runs:

- Manually through `workflow_dispatch`.
- Weekly on Monday.
- When Lighthouse configuration changes on `main`.

When the target site and budgets are stable, warning thresholds can be changed to failing assertions. Until then, the workflow should stay green while still uploading reports and printing actionable warnings.

## CodeQL

CodeQL is GitHub's static security analysis engine. It scans code for bug and vulnerability patterns before they become production issues.

This repo currently scans:

- JavaScript and TypeScript, including local `.mjs` automation scripts.
- GitHub Actions workflow code.

The GitHub workflow runs:

- On pull requests to `main`.
- On pushes to `main`.
- Weekly on Tuesday.

Findings appear in the repository's GitHub Security tab.

## Current Policy

- Lighthouse CI is an early-warning signal, not a deployment blocker yet.
- CodeQL findings should be reviewed before merging changes that introduce application code, deployment logic, authentication, or data processing.
