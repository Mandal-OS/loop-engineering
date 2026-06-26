# Audit CLI

The repository includes a dependency-free website audit command for fast production-readiness screening.

## Run A Lightweight Audit

```powershell
npm run audit:url -- https://example.com
```

The command creates or updates:

```text
audits/YYYY-MM-DD-example.com/report.md
audits/YYYY-MM-DD-example.com/network/summary.json
```

## What It Checks

- Final HTTP status and redirect chain.
- Primary document headers.
- Security headers.
- Mixed-content references.
- Title, meta description, canonical URL, H1s, H2s, JSON-LD, Open Graph, and Twitter card metadata.
- `robots.txt` and `sitemap.xml` availability.
- Sampled image, script, stylesheet, and internal-link status codes.
- Basic performance signals such as HTML size, script count, stylesheet count, cache headers, and image dimensions.
- Basic accessibility and UX signals such as missing image alt attributes and heading structure.

## What It Does Not Replace

This command is intentionally lightweight. Before launch, still run:

- Lighthouse or Lighthouse CI.
- Real browser testing on mobile and desktop.
- Authenticated critical-flow tests.
- Manual accessibility review.
- Console and network inspection.
- Production monitoring review.

## Create An Empty Audit Folder

Use this when you want to collect evidence manually:

```powershell
npm run audit:new -- https://example.com
```
