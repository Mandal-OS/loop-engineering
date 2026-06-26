# Owner Inputs

These are the only decisions needed before the repository can be fully published and configured on GitHub.

## Required

- GitHub owner or organization.
- Repository name.
- Public or private visibility.
- License choice: proprietary, MIT, Apache-2.0, GPL, or another license.
- Primary repo identity:
  - Company profile.
  - Portfolio site.
  - Website audit toolkit.
  - Product codebase.
  - Engineering handbook.
  - Monorepo.
- Production domain, if this repo will ship a site.
- Maintainer GitHub handle for CODEOWNERS.

## Strongly Recommended

- One-sentence positioning statement.
- Primary audience.
- Core services or products.
- Contact email.
- Social links.
- Brand assets: logo, colors, typefaces.
- Deployment target: Vercel, Netlify, Cloudflare, AWS, VPS, or other.
- Analytics preference.
- Privacy and cookie requirements.

## Answers To Send Back

Copy this block and fill it in:

```text
GitHub owner/org:
Repo name:
Visibility:
License:
Primary repo identity:
Production domain:
Maintainer GitHub handle:
Positioning:
Primary audience:
Contact email:
Deployment target:
Analytics preference:
```

## Defaults If You Are Unsure

- Repo name: `loop-engineering`
- Visibility: private until ready to launch
- License: proprietary
- Branch: `main`
- Merge strategy: squash merge
- Deployment: Vercel for a marketing site, Cloudflare for static assets, or platform-specific hosting for product apps
