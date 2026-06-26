# Repository Setup

Use this checklist when publishing Loop Engineering to GitHub.

## Decisions Needed From The Owner

- GitHub owner or organization.
- Repository name.
- Public or private visibility.
- License choice: proprietary, MIT, Apache-2.0, or another license.
- Primary purpose: company profile, engineering handbook, audit toolkit, product app, or monorepo.
- Production domain, if this repo will contain a website.
- Maintainer GitHub handles for CODEOWNERS.

## Recommended GitHub Settings

- Default branch: `main`.
- Require pull requests before merging.
- Require status checks to pass before merging.
- Require conversation resolution before merging.
- Enable Dependabot alerts.
- Enable Dependabot security updates.
- Enable secret scanning and push protection if available.
- Disable force pushes on protected branches.
- Squash merge by default unless a linear history policy is preferred.

## Suggested Topics

```text
engineering
performance
security
seo
web-audit
launch-readiness
full-stack
```

## First Publish Commands

After the GitHub repository is created:

```powershell
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

Replace `OWNER` and `REPOSITORY` with the final GitHub details.

## Optional CODEOWNERS

Create `.github/CODEOWNERS` only after maintainer handles are known:

```text
* @OWNER/maintainers
```

For personal repos:

```text
* @github-handle
```
