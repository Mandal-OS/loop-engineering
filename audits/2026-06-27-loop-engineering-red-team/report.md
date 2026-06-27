# Loop Engineering Red-Team Review

Date: 2026-06-27
Target: https://github.com/Mandal-OS/loop-engineering
Reviewer: Codex

## Executive Summary

- Overall rating: Good
- Public launch readiness: 88%
- Scope: public GitHub repository, local scripts, documentation, workflow configuration, security settings, branch protection, and public presentation.

The repository is in a strong state for an early public engineering foundation. The main security surfaces are configured well: branch protection is enabled, admin bypass is disabled, force pushes and branch deletion are blocked, secret scanning and push protection are enabled, and the quality workflow runs with read-only permissions.

## Strengths

- `main` is protected with required status checks and conversation resolution.
- GitHub secret scanning, push protection, Dependabot alerts, and security updates are enabled.
- GitHub Actions workflow uses `contents: read` and no elevated token permissions.
- Local checks cover documentation completeness, Markdown links, script syntax, and common secret patterns.
- No Dependabot or secret-scanning alerts were open at review time.
- Public README, issue templates, support policy, security policy, labels, and profile README are configured.

## Fixed During Review

| Finding | Risk | Fix |
| --- | --- | --- |
| Admins could bypass branch protection on `main`. | Medium | Enabled branch protection enforcement for admins. |
| Security issue template linked to generic `https://github.com/`. | Low | Updated the link to the repository security policy. |
| Profile had no profile README. | Low | Created `Mandal-OS/Mandal-OS` with a public profile README. |
| Local secret-pattern scan covered only a small token set. | Medium | Expanded scanner coverage for GitHub fine-grained PATs, npm tokens, Google API keys, Slack tokens, and Discord webhooks. |
| Security policy still implied private reporting was not configured. | Low | Updated policy wording for private vulnerability reporting. |

## Current Evidence

- `npm run check`: passed.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- GitHub secret-scanning alerts: 0.
- GitHub Dependabot alerts: 0.
- Latest `Repo Quality` workflow run: passed.
- Open pull requests at audit time: 0.

## Residual Risks

| Finding | Risk | Recommendation |
| --- | --- | --- |
| GitHub Actions use version tags instead of full commit SHAs. | Low | For stricter supply-chain control, pin `actions/checkout` and `actions/setup-node` to commit SHAs and keep Dependabot configured for GitHub Actions. |
| License is proprietary while the repository is public. | Low | This is legally valid, but it may confuse contributors. Choose MIT or Apache-2.0 later if open-source reuse is desired. |
| No CodeQL/code scanning workflow exists. | Low | Add CodeQL when real application code enters `apps/` or shared packages enter `packages/`. |
| Profile display name and bio were not editable with the current GitHub CLI token scope. | Low | Run `gh auth refresh -h github.com -s user`, then update profile name/bio through the API or GitHub settings. |
| `audit:url` can fetch arbitrary URLs from the local machine. | Low | Acceptable for a developer-run CLI. If this is ever exposed as a hosted service, add allowlists, rate limits, network egress controls, and SSRF protections. |

## Red-Team Notes

- No committed secrets were found by local checks or GitHub secret scanning.
- The workflow does not use `pull_request_target`, which avoids a common public-repo token exposure pitfall.
- The workflow permissions are intentionally minimal.
- Branch protection now applies to admins, closing the direct-push bypass observed during the polish commit.
- The repo is mostly documentation and local scripts today, so attack surface is low. Risk will rise when app code, deployment credentials, CI release jobs, package publishing, or production infrastructure are added.

## Next Hardening Steps

1. Choose an explicit open-source license only if public reuse is desired.
2. Add CodeQL when application code exists.
3. Pin GitHub Actions to SHAs if the project becomes security-critical.
4. Add a second maintainer before requiring external PR approval.
5. Add deployment environment protection rules before any production deploy workflow is introduced.
