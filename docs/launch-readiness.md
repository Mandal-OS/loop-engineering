# Launch Readiness

Use this before any public launch, major marketing push, or expected high-traffic event.

## Launch Readiness Score

Score each area from 0 to 10, then multiply by 10 for a 100-point launch score.

| Area | Requirement |
| --- | --- |
| Technical health | No critical broken routes, assets, APIs, redirects, sitemap, or robots issues |
| Performance | Core Web Vitals pass on realistic mobile and desktop conditions |
| Security | HTTPS, hardened headers, no exposed secrets, safe forms, no mixed content |
| SEO | Unique metadata, canonical URLs, structured data, sitemap, clean internal linking |
| Accessibility | Keyboard access, contrast, labels, alt text, semantic markup |
| UX | Clear flows, responsive layouts, no blocking console or network errors |
| Conversion | Clear CTA hierarchy, trust signals, low-friction path to action |
| Operations | Monitoring, backups, rollback, deployment ownership |
| Analytics | Event tracking, conversion goals, privacy-aware measurement |
| Scalability | CDN, caching, rate limits, database and API capacity planning |

## Launch Blockers

- Any route returning unexpected 4xx or 5xx for primary user flows.
- Console errors that break navigation, forms, checkout, auth, or content loading.
- Exposed credentials or sensitive data.
- Missing HTTPS enforcement.
- Forms without server-side validation.
- LCP above 4 seconds on key landing pages.
- CLS above 0.25.
- No rollback path.
- No owner for production incident response.

## Preflight Checklist

- Crawl primary routes and verify status codes.
- Check `robots.txt`, `sitemap.xml`, canonical URLs, and Open Graph tags.
- Test mobile navigation, forms, CTAs, and critical conversion paths.
- Run Lighthouse or equivalent on slow mobile and desktop profiles.
- Inspect network requests for failed assets and API errors.
- Verify cache headers for static assets.
- Confirm security headers.
- Verify analytics events without collecting unnecessary personal data.
- Confirm backups and rollback.
- Create a launch issue with owner, launch date, risks, and go or no-go decision.

## Audit Workspace

Create a dated audit workspace before collecting evidence:

```powershell
npm run audit:new -- https://example.com
```

Store screenshots, Lighthouse exports, crawl output, and network evidence in the generated folder under `audits/`.

Run a lightweight URL audit:

```powershell
npm run audit:url -- https://example.com
```

Use the generated report as a first pass, then validate with browser-based testing.
