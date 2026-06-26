# Security Policy

Loop Engineering treats security issues as launch blockers when they can expose users, infrastructure, credentials, private data, payment flows, or production availability.

## Supported Scope

This repository currently contains documentation, automation, and future project structure. Security review applies to:

- Repository configuration.
- CI workflows.
- Scripts.
- Documentation containing operational procedures.
- Future application, package, and infrastructure code.

## Reporting a Vulnerability

Do not open public issues for sensitive vulnerabilities.

Send a private report to the repository owner or security contact once configured in GitHub. Include:

- Affected files, routes, domains, or systems.
- Reproduction steps.
- Impact.
- Suggested fix, if known.
- Whether any credentials, personal data, or production systems may be exposed.

## Severity Guide

High:

- Credential exposure.
- Authentication or authorization bypass.
- Stored XSS.
- Remote code execution.
- Production data exposure.
- Payment or account takeover risk.

Medium:

- Reflected XSS with user interaction.
- Missing security headers on production.
- Sensitive metadata exposure.
- Weak form validation.
- Insecure redirects.

Low:

- Documentation-only security gaps.
- Hardening opportunities with limited immediate exploitability.

## Baseline Requirements

Production web properties should enforce:

- HTTPS with redirect from HTTP.
- HSTS after HTTPS is stable.
- Content Security Policy.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` with unused browser features disabled.
- Clickjacking protection through CSP `frame-ancestors`.
- Secure, HTTP-only, SameSite cookies when cookies are used.
- Server-side validation and output encoding for forms and user-generated content.

See [Security Baseline](docs/security-baseline.md) for exact header examples.
