# Performance Budget

Performance work should protect real user experience first. Use lab tools for diagnosis, then validate with field data when available.

## Core Web Vitals Targets

| Metric | Good | Launch Blocker |
| --- | ---: | ---: |
| LCP | <= 2.5s | > 4.0s |
| INP | <= 200ms | > 500ms |
| CLS | <= 0.1 | > 0.25 |
| TTFB | <= 800ms | > 1.8s |

## Asset Budgets

| Asset Type | Initial Route Target |
| --- | ---: |
| JavaScript, compressed | <= 170 KB |
| CSS, compressed | <= 50 KB |
| Fonts | <= 2 families, <= 4 files |
| Hero image | <= 200 KB where possible |
| Total image bytes above the fold | <= 350 KB |

## Required Practices

- Serve images at the displayed size.
- Prefer AVIF or WebP for raster images.
- Use explicit width and height or aspect ratio for media.
- Lazy-load below-the-fold images and iframes.
- Preload only the actual LCP asset and critical fonts.
- Use `font-display: swap` or `optional`.
- Defer non-critical JavaScript.
- Split code by route when application code is added.
- Cache immutable static assets for one year with content hashes.

## Example Cache Headers

Static hashed assets:

```text
Cache-Control: public, max-age=31536000, immutable
```

HTML:

```text
Cache-Control: public, max-age=0, must-revalidate
```

API responses:

```text
Cache-Control: private, no-store
```

Use a more specific API cache strategy when responses are public, safe to cache, and invalidation is understood.
