# Contributing

Thanks for improving Loop Engineering. Keep contributions focused, reviewable, and easy to verify.

## Development Flow

1. Create a branch from the current default branch.
2. Make the smallest useful change.
3. Run the repository checks.
4. Open a pull request with verification notes.

```powershell
npm install
npm run check
```

## Pull Request Standard

Every pull request should include:

- What changed.
- Why it changed.
- How it was tested.
- Screenshots or audit evidence for visible or user-facing work.
- Security, performance, SEO, or accessibility risks introduced or reduced.

## Commit Style

Use clear, action-oriented commit messages:

```text
Add launch readiness checklist
Harden repository secret scanning
Document SEO metadata standard
```

## Documentation

Update docs when changing:

- Architecture.
- Security posture.
- Deployment or operational procedures.
- SEO, analytics, performance, or conversion standards.
- Public-facing behavior.

## Review Priorities

Reviewers should look first for:

- Security regressions.
- Broken workflows.
- Performance problems.
- Accessibility issues.
- SEO regressions.
- Unclear ownership or rollback paths.
