# Release Process

Use this process for public website launches, product releases, and important documentation updates.

## Release Types

- Patch: typo, small doc, low-risk config, minor bug fix.
- Minor: new doc set, new workflow, new app feature, non-breaking product change.
- Major: framework migration, hosting change, security posture change, breaking API or user-flow change.

## Pre-Release Checklist

- Pull request reviewed.
- `npm run check` passes.
- Security impact reviewed.
- Performance impact reviewed for user-facing work.
- SEO impact reviewed for public pages.
- Accessibility impact reviewed for UI changes.
- Rollback path documented.
- Monitoring or analytics impact understood.

## Release Notes Template

```text
## Summary

## Changes

## Verification

## Risks

## Rollback
```

## Hotfix Process

- Prioritize containment and user impact.
- Keep the change minimal.
- Document what was skipped because of urgency.
- Follow up with tests, docs, or cleanup immediately after the incident is stable.
