# Loop Engineering

Production-grade engineering workspace for building, auditing, and launching fast, secure, SEO-ready web products.

This repository is set up as the operating base for Loop Engineering: documentation, standards, checklists, automation, and future application code can live here without becoming messy as the project grows.

## Status

Foundation repo: ready for GitHub, CI, documentation, audit reports, and future code.

Add product code under `apps/`, shared code under `packages/`, and launch/audit work under `audits/`.

## What This Repo Includes

- Production launch standards for traffic, performance, security, SEO, UX, and conversion readiness.
- A high-signal `AGENTS.md` so AI coding agents know how to operate inside the repo.
- GitHub issue templates, pull request template, Dependabot config, and repository quality workflow.
- Local repository checks for required docs, broken internal Markdown links, and common leaked secret patterns.
- Practical playbooks for performance budgets, security headers, SEO, conversion, architecture, and launch readiness.
- An audit scaffold command for consistent website audit evidence and reports.

## Repository Map

```text
.
|-- .github/                 GitHub workflows and collaboration templates
|-- apps/                    Future deployable apps
|-- audits/                  Website, SEO, performance, and security audit reports
|-- docs/                    Engineering and launch playbooks
|-- packages/                Future shared libraries or internal packages
|-- scripts/                 Repo quality checks
|-- AGENTS.md                Agent instructions and audit operating standard
|-- CONTRIBUTING.md          Contribution workflow
|-- SECURITY.md              Security policy and disclosure process
|-- package.json             Local automation entrypoint
```

## Quick Start

```powershell
npm install
npm run check
```

The default checks validate the repository foundation without requiring external services.

Create a new website audit folder:

```powershell
npm run audit:new -- https://example.com
```

## Launch Standard

Loop Engineering work should meet these minimums before public launch:

- Core Web Vitals: LCP at or below 2.5s, INP at or below 200ms, CLS at or below 0.1.
- Security: HTTPS enforced, no mixed content, hardened headers, no exposed secrets, safe form handling.
- SEO: unique metadata, valid canonical URLs, sitemap and robots coverage, structured data where useful.
- UX: responsive layouts, accessible controls, clear page flow, visible calls to action, no console-breaking errors.
- Operations: clear ownership, rollback path, monitoring, backups, and incident response notes.

See [Launch Readiness](docs/launch-readiness.md), [Performance Budget](docs/performance-budget.md), [Security Baseline](docs/security-baseline.md), and [SEO Playbook](docs/seo-playbook.md).

## GitHub Setup

Before pushing this repository to GitHub, decide:

- GitHub owner or organization.
- Repository name.
- Public or private visibility.
- License model: proprietary by default here, or open-source if you choose.
- Primary project type: company profile, portfolio site, client audit toolkit, product app, or engineering handbook.

Use [Owner Inputs](docs/owner-inputs.md) and [Repository Setup](docs/repository-setup.md) for the exact GitHub configuration checklist.

## Operating Docs

- [Roadmap](docs/roadmap.md)
- [Release Process](docs/release-process.md)
- [Operations Runbook](docs/operations-runbook.md)
- [Accessibility Playbook](docs/accessibility-playbook.md)
- [Analytics and Measurement](docs/analytics-measurement.md)

## Working Agreement

Every meaningful change should answer three questions:

1. What user, business, or operational problem does this solve?
2. How was it verified?
3. What risk does it introduce or reduce?

For contribution details, see [CONTRIBUTING.md](CONTRIBUTING.md).
