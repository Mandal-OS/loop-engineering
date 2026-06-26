# Architecture

This repository starts as a documentation and automation foundation. It is structured so application code can be added without reorganizing the project later.

## Intended Layout

```text
apps/
  web/              Public website or primary application
  api/              API service, if separated
packages/
  ui/               Shared UI components
  config/           Shared lint, TypeScript, or build config
  utils/            Shared utilities
audits/
  YYYY-MM-DD-site/  Audit reports and evidence
docs/
  decisions/        Architecture decision records
```

## Architecture Principles

- Keep user-facing apps deployable independently when possible.
- Keep shared packages small and boring.
- Prefer server-side validation for anything security-sensitive.
- Make performance budgets visible in pull requests.
- Keep SEO metadata close to route ownership.
- Use environment variables for deploy-time configuration.
- Document production dependencies and ownership.

## Decision Records

Use a decision record when changing:

- Frameworks.
- Hosting.
- Database or storage.
- Authentication.
- Payment providers.
- Analytics.
- Security posture.
- Performance budgets.

Start with [0001 Repository Foundation](decisions/0001-repository-foundation.md).
