# SEO Playbook

SEO work should make pages easier to understand for people and crawlers.

## Page Metadata Standard

Every indexable page should have:

- Unique title, ideally 45 to 60 characters.
- Unique meta description, ideally 120 to 160 characters.
- Canonical URL.
- One clear H1.
- Logical H2 and H3 structure.
- Open Graph title, description, URL, image, and type.
- Twitter card metadata.
- Descriptive image alt text.

## URL Rules

- Use lowercase slugs.
- Avoid dates in URLs unless the date is meaningful.
- Avoid query parameters for canonical content.
- Redirect old URLs with single-hop 301 redirects.
- Keep internal links absolute or root-relative in rendered HTML.

## JSON-LD Examples

Organization:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Loop Engineering",
  "url": "https://example.com",
  "sameAs": []
}
```

Service:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Website Launch Audit",
  "provider": {
    "@type": "Organization",
    "name": "Loop Engineering"
  },
  "areaServed": "Worldwide"
}
```

Replace `https://example.com` with the production domain before launch.

## Sitemap Rules

- Include canonical indexable URLs only.
- Exclude admin, auth, search, filter, and duplicate pages unless intentionally indexable.
- Update automatically during builds when possible.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools.

## Robots Rules

- Do not block production assets needed for rendering.
- Block private, staging, admin, and internal search routes.
- Include the sitemap URL.

Example:

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```
