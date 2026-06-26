# Operations Runbook

This runbook defines minimum production operations expectations for Loop Engineering projects.

## Ownership

Every production property should have:

- Primary owner.
- Backup owner.
- Deployment owner.
- Incident contact.
- Source repository.
- Hosting provider.
- DNS provider.
- Monitoring dashboard.

## Incident Severity

High:

- Site or critical flow unavailable.
- Security incident.
- Data exposure.
- Payment, booking, signup, or login broken.
- Large traffic spike causing instability.

Medium:

- Degraded performance.
- Partial feature outage.
- Analytics outage during campaign.
- SEO-critical pages unavailable.

Low:

- Minor content issue.
- Non-critical UI defect.
- Documentation issue.

## Incident Response

1. Confirm the issue with evidence.
2. Assign an owner.
3. Stop active harm.
4. Communicate status to stakeholders.
5. Apply the smallest safe fix or rollback.
6. Verify recovery.
7. Write a short post-incident note.

## Monitoring Minimums

- Uptime check for public pages.
- Error tracking for application code.
- Core Web Vitals monitoring for public pages.
- Security alerting for dependency and secret exposure.
- Backup success checks when data is stored.
- Domain and certificate expiration reminders.

## Rollback

Before each launch, document:

- Last known good deployment.
- Rollback command or platform button path.
- Database rollback or forward-fix plan.
- DNS rollback constraints.
- Owner authorized to execute rollback.
