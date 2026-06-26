import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = process.argv[2];

if (!target) {
  console.error("Usage: npm run audit:url -- https://example.com");
  process.exit(1);
}

let startUrl;
try {
  startUrl = new URL(target);
} catch {
  console.error(`Invalid URL: ${target}`);
  process.exit(1);
}

if (!["http:", "https:"].includes(startUrl.protocol)) {
  console.error("Audit URL must use http or https.");
  process.exit(1);
}

const timeoutMs = 15000;
const maxRedirects = 10;
const maxAssets = 30;
const maxLinks = 40;
const userAgent = "LoopEngineeringAudit/0.1 (+https://github.com/loop-engineering)";

function localDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function auditFolderFor(url) {
  const host = url.hostname.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  return join(root, "audits", `${localDate()}-${host}`);
}

function textBetween(value, max = 140) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 3)}...`;
}

function escapeMarkdown(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .trim();
}

function headerObject(headers) {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key.toLowerCase()] = value;
  }
  return result;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      headers: {
        "user-agent": userAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(options.headers ?? {})
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDocument(url) {
  const redirects = [];
  let current = new URL(url.href);

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const started = performance.now();
    const response = await fetchWithTimeout(current, { redirect: "manual" });
    const durationMs = Math.round(performance.now() - started);
    const headers = headerObject(response.headers);

    redirects.push({
      url: current.href,
      status: response.status,
      durationMs,
      location: headers.location ?? ""
    });

    if (response.status >= 300 && response.status < 400 && headers.location) {
      current = new URL(headers.location, current);
      continue;
    }

    const body = await response.text();
    return {
      finalUrl: current,
      response,
      headers,
      redirects,
      body
    };
  }

  throw new Error(`Too many redirects after ${maxRedirects} hops.`);
}

async function fetchStatus(url, method = "HEAD") {
  try {
    const started = performance.now();
    const response = await fetchWithTimeout(url, {
      method,
      redirect: "manual",
      headers: { accept: "*/*" }
    });

    const result = {
      ok: true,
      url: url.href,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      headers: headerObject(response.headers)
    };

    if (method === "HEAD" && [403, 405].includes(result.status)) {
      return fetchStatus(url, "GET");
    }

    return result;
  } catch (error) {
    return {
      ok: false,
      url: url.href,
      status: 0,
      durationMs: 0,
      error: error instanceof Error ? error.message : String(error),
      headers: {}
    };
  }
}

async function fetchTextStatus(url) {
  try {
    const response = await fetchWithTimeout(url, { redirect: "follow" });
    const text = await response.text();
    return {
      ok: true,
      url: url.href,
      status: response.status,
      headers: headerObject(response.headers),
      text
    };
  } catch (error) {
    return {
      ok: false,
      url: url.href,
      status: 0,
      headers: {},
      text: "",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    result[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? "";
  }
  return result;
}

function metaContent(html, name) {
  const lowerName = name.toLowerCase();
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    if ((attributes.name ?? "").toLowerCase() === lowerName || (attributes.property ?? "").toLowerCase() === lowerName) {
      return attributes.content ?? "";
    }
  }

  return "";
}

function linkHref(html, relName) {
  const lowerRel = relName.toLowerCase();
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    const rels = (attributes.rel ?? "").toLowerCase().split(/\s+/);
    if (rels.includes(lowerRel)) {
      return attributes.href ?? "";
    }
  }

  return "";
}

function allTags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function headingTexts(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))]
    .map((match) => textBetween(match[1].replace(/<[^>]*>/g, " "), 120))
    .filter(Boolean);
}

function absoluteUrl(value, base) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

function parseHtml(html, baseUrl) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? textBetween(titleMatch[1], 220) : "";
  const description = metaContent(html, "description");
  const canonicalRaw = linkHref(html, "canonical");
  const canonical = canonicalRaw ? absoluteUrl(canonicalRaw, baseUrl)?.href ?? canonicalRaw : "";
  const h1 = headingTexts(html, "h1");
  const h2 = headingTexts(html, "h2");
  const imageTags = allTags(html, "img");
  const scriptTags = allTags(html, "script");
  const linkTags = allTags(html, "link");
  const anchorTags = allTags(html, "a");

  const images = imageTags.map((tag) => attrs(tag));
  const scripts = scriptTags.map((tag) => attrs(tag));
  const links = linkTags.map((tag) => attrs(tag));
  const anchors = anchorTags.map((tag) => attrs(tag));

  const imageUrls = images.map((image) => absoluteUrl(image.src, baseUrl)?.href).filter(Boolean);
  const scriptUrls = scripts.map((script) => absoluteUrl(script.src, baseUrl)?.href).filter(Boolean);
  const stylesheetUrls = links
    .filter((link) => (link.rel ?? "").toLowerCase().split(/\s+/).includes("stylesheet"))
    .map((link) => absoluteUrl(link.href, baseUrl)?.href)
    .filter(Boolean);
  const anchorUrls = anchors
    .map((anchor) => absoluteUrl(anchor.href, baseUrl)?.href)
    .filter(Boolean)
    .filter((href) => href.startsWith("http://") || href.startsWith("https://"));

  const jsonLdCount = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/gi)].length;
  const inlineScriptCount = scripts.filter((script) => !script.src).length;
  const missingAltCount = images.filter((image) => !("alt" in image)).length;
  const missingDimensionsCount = images.filter((image) => !image.width || !image.height).length;
  const httpResourceCount = unique([...imageUrls, ...scriptUrls, ...stylesheetUrls]).filter((url) => url.startsWith("http://")).length;

  return {
    title,
    description,
    canonical,
    h1,
    h2,
    ogTitle: metaContent(html, "og:title"),
    ogDescription: metaContent(html, "og:description"),
    ogImage: metaContent(html, "og:image"),
    ogUrl: metaContent(html, "og:url"),
    twitterCard: metaContent(html, "twitter:card"),
    jsonLdCount,
    imageCount: images.length,
    missingAltCount,
    missingDimensionsCount,
    scriptCount: scripts.length,
    externalScriptCount: scriptUrls.length,
    inlineScriptCount,
    stylesheetCount: stylesheetUrls.length,
    anchorCount: anchors.length,
    imageUrls: unique(imageUrls),
    scriptUrls: unique(scriptUrls),
    stylesheetUrls: unique(stylesheetUrls),
    anchorUrls: unique(anchorUrls),
    httpResourceCount
  };
}

function securityFindings(headers, finalUrl) {
  const findings = [];
  const csp = headers["content-security-policy"] ?? "";

  if (finalUrl.protocol !== "https:") {
    findings.push({
      risk: "High",
      issue: "Final page does not use HTTPS",
      fix: "Redirect all HTTP traffic to HTTPS before serving application content."
    });
  }

  if (!headers["strict-transport-security"] && finalUrl.protocol === "https:") {
    findings.push({
      risk: "Medium",
      issue: "Missing HSTS header",
      fix: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` after all subdomains support HTTPS."
    });
  }

  if (!csp) {
    findings.push({
      risk: "High",
      issue: "Missing Content Security Policy",
      fix: "Start with a restrictive CSP using `default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` and open only required sources."
    });
  }

  if (!headers["x-content-type-options"]) {
    findings.push({
      risk: "Medium",
      issue: "Missing X-Content-Type-Options",
      fix: "Add `X-Content-Type-Options: nosniff`."
    });
  }

  if (!headers["referrer-policy"]) {
    findings.push({
      risk: "Low",
      issue: "Missing Referrer-Policy",
      fix: "Add `Referrer-Policy: strict-origin-when-cross-origin`."
    });
  }

  if (!headers["permissions-policy"]) {
    findings.push({
      risk: "Low",
      issue: "Missing Permissions-Policy",
      fix: "Disable unused browser features, for example `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`."
    });
  }

  if (!headers["x-frame-options"] && !/frame-ancestors/i.test(csp)) {
    findings.push({
      risk: "Medium",
      issue: "Missing clickjacking protection",
      fix: "Prefer CSP `frame-ancestors 'none'` or add `X-Frame-Options: DENY` for legacy coverage."
    });
  }

  return findings;
}

function seoFindings(parsed, finalUrl) {
  const findings = [];

  if (!parsed.title) {
    findings.push("Missing `<title>` tag.");
  } else if (parsed.title.length < 20 || parsed.title.length > 65) {
    findings.push(`Title length is ${parsed.title.length}; target roughly 45 to 60 characters.`);
  }

  if (!parsed.description) {
    findings.push("Missing meta description.");
  } else if (parsed.description.length < 80 || parsed.description.length > 170) {
    findings.push(`Meta description length is ${parsed.description.length}; target roughly 120 to 160 characters.`);
  }

  if (!parsed.canonical) {
    findings.push("Missing canonical URL.");
  } else if (parsed.canonical !== finalUrl.href) {
    findings.push(`Canonical differs from final URL: ${parsed.canonical}`);
  }

  if (parsed.h1.length !== 1) {
    findings.push(`Expected exactly one H1; found ${parsed.h1.length}.`);
  }

  if (parsed.jsonLdCount === 0) {
    findings.push("No JSON-LD structured data found.");
  }

  if (!parsed.ogTitle || !parsed.ogDescription || !parsed.ogImage || !parsed.ogUrl) {
    findings.push("Open Graph metadata is incomplete.");
  }

  if (!parsed.twitterCard) {
    findings.push("Missing Twitter card metadata.");
  }

  return findings;
}

function performanceFindings(parsed, htmlBytes, headers) {
  const findings = [];
  const contentLength = Number(headers["content-length"] ?? htmlBytes);

  if (contentLength > 100_000) {
    findings.push(`HTML document is ${Math.round(contentLength / 1024)} KB; reduce server-rendered payload and inline content.`);
  }

  if (parsed.externalScriptCount > 10) {
    findings.push(`Page references ${parsed.externalScriptCount} external scripts; audit unused scripts and defer non-critical JavaScript.`);
  }

  if (parsed.inlineScriptCount > 5) {
    findings.push(`Page includes ${parsed.inlineScriptCount} inline scripts; reduce inline execution and move non-critical code out of the critical path.`);
  }

  if (parsed.stylesheetCount > 5) {
    findings.push(`Page references ${parsed.stylesheetCount} stylesheets; consolidate or inline only critical CSS.`);
  }

  if (parsed.missingDimensionsCount > 0) {
    findings.push(`${parsed.missingDimensionsCount} images are missing explicit width or height; add dimensions or aspect ratios to reduce CLS.`);
  }

  if (!headers["cache-control"]) {
    findings.push("Main HTML response has no Cache-Control header.");
  }

  return findings;
}

function uxFindings(parsed) {
  const findings = [];

  if (parsed.missingAltCount > 0) {
    findings.push(`${parsed.missingAltCount} images are missing alt attributes.`);
  }

  if (parsed.anchorCount < 3) {
    findings.push("Very few links found; confirm users have clear navigation and next actions.");
  }

  if (parsed.h2.length === 0) {
    findings.push("No H2 headings found; long pages should use section headings for scanability.");
  }

  return findings;
}

function ratingFromFindings(counts) {
  const score = Math.max(
    0,
    100 -
      counts.high * 18 -
      counts.medium * 10 -
      counts.low * 4 -
      counts.seo * 5 -
      counts.performance * 5 -
      counts.ux * 4 -
      counts.broken * 8
  );

  let rating = "Excellent";
  if (score < 90) {
    rating = "Good";
  }
  if (score < 75) {
    rating = "Fair";
  }
  if (score < 60) {
    rating = "Needs Work";
  }

  return { score, rating };
}

function tableRows(rows, columns) {
  if (rows.length === 0) {
    return "No issues found by this lightweight check.";
  }

  return rows
    .map((row) => `| ${columns.map((column) => escapeMarkdown(row[column])).join(" | ")} |`)
    .join("\n");
}

async function main() {
  const document = await fetchDocument(startUrl);
  const finalUrl = document.finalUrl;
  const parsed = parseHtml(document.body, finalUrl);
  const origin = finalUrl.origin;
  const htmlBytes = Buffer.byteLength(document.body, "utf8");

  const robots = await fetchTextStatus(new URL("/robots.txt", origin));
  const sitemapDefault = await fetchStatus(new URL("/sitemap.xml", origin));
  const sitemapUrls = unique(
    [
      ...[...robots.text.matchAll(/^sitemap:\s*(.+)$/gim)].map((match) => match[1].trim()),
      `${origin}/sitemap.xml`
    ].map((value) => absoluteUrl(value, finalUrl)?.href)
  );

  const sampledAssets = unique([
    ...parsed.scriptUrls,
    ...parsed.stylesheetUrls,
    ...parsed.imageUrls
  ]).slice(0, maxAssets);
  const sampledInternalLinks = parsed.anchorUrls
    .filter((href) => new URL(href).origin === origin)
    .slice(0, maxLinks);

  const assetResults = await Promise.all(sampledAssets.map((url) => fetchStatus(new URL(url))));
  const linkResults = await Promise.all(sampledInternalLinks.map((url) => fetchStatus(new URL(url))));
  const sitemapResults = await Promise.all(sitemapUrls.slice(0, 5).map((url) => fetchStatus(new URL(url))));

  const brokenAssets = assetResults.filter((result) => !result.ok || result.status >= 400 || result.status === 0);
  const brokenLinks = linkResults.filter((result) => !result.ok || result.status >= 400 || result.status === 0);
  const missingSecurity = securityFindings(document.headers, finalUrl);
  const seo = seoFindings(parsed, finalUrl);
  const performance = performanceFindings(parsed, htmlBytes, document.headers);
  const ux = uxFindings(parsed);
  const mixedContent = parsed.httpResourceCount > 0;

  if (mixedContent) {
    missingSecurity.push({
      risk: "High",
      issue: `${parsed.httpResourceCount} HTTP subresources referenced from the page`,
      fix: "Serve all images, scripts, styles, fonts, and embeds over HTTPS."
    });
  }

  const riskCounts = {
    high: missingSecurity.filter((finding) => finding.risk === "High").length,
    medium: missingSecurity.filter((finding) => finding.risk === "Medium").length,
    low: missingSecurity.filter((finding) => finding.risk === "Low").length,
    seo: seo.length,
    performance: performance.length,
    ux: ux.length,
    broken: brokenAssets.length + brokenLinks.length
  };
  const { rating, score } = ratingFromFindings(riskCounts);
  const folder = auditFolderFor(finalUrl);
  const strengths = [
    document.response.status >= 200 && document.response.status < 300
      ? "Primary document returns a successful status."
      : "",
    finalUrl.protocol === "https:" ? "Final URL uses HTTPS." : "",
    parsed.title ? "Page has a title tag." : "",
    parsed.description ? "Page has a meta description." : "",
    parsed.canonical ? "Page declares a canonical URL." : "",
    robots.status > 0 && robots.status < 400 ? "robots.txt is reachable." : "",
    sitemapDefault.status > 0 && sitemapDefault.status < 400 ? "sitemap.xml is reachable." : "",
    missingSecurity.length === 0 ? "Required baseline security headers are present." : ""
  ].filter(Boolean).slice(0, 3);

  mkdirSync(join(folder, "network"), { recursive: true });

  const report = `# ${finalUrl.hostname} Lightweight Website Audit

Target: ${startUrl.href}
Final URL: ${finalUrl.href}
Date: ${localDate()}

This report is generated by \`npm run audit:url\`. It is a fast technical screen, not a replacement for browser-based Lighthouse, real-user monitoring, authenticated-flow testing, or manual UX review.

## 1. Executive Summary

- Overall rating: ${rating}
- Launch readiness score: ${score}%
- Main status: ${document.response.status}
- Redirect hops: ${Math.max(0, document.redirects.length - 1)}
- HTML size: ${Math.round(htmlBytes / 1024)} KB
- Sampled assets: ${sampledAssets.length}
- Sampled internal links: ${sampledInternalLinks.length}

## Top Strengths

${strengths.map((item) => `- ${item}`).join("\n") || "- No launch-readiness strengths found by this lightweight check."}

## Top Critical Issues

${[
    ...missingSecurity.filter((finding) => finding.risk === "High").map((finding) => finding.issue),
    ...brokenAssets.slice(0, 2).map((asset) => `Broken asset: ${asset.url}`),
    ...brokenLinks.slice(0, 2).map((link) => `Broken internal link: ${link.url}`),
    ...seo.slice(0, 3)
  ]
    .slice(0, 5)
    .map((item) => `- ${item}`)
    .join("\n") || "- No critical issue found by this lightweight check."}

## 2. Critical Issues

| Issue | Why It Matters | Exact Fix |
| --- | --- | --- |
${tableRows(
    [
      ...missingSecurity
        .filter((finding) => finding.risk === "High")
        .map((finding) => ({
          issue: finding.issue,
          why: "Security issues can expose users, data, or the production surface before scale.",
          fix: finding.fix
        })),
      ...brokenAssets.map((asset) => ({
        issue: `Broken asset: ${asset.url}`,
        why: "Missing assets can break layout, functionality, SEO previews, or conversion flows.",
        fix: `Restore the asset or update the reference. Observed status: ${asset.status || asset.error}.`
      })),
      ...brokenLinks.map((link) => ({
        issue: `Broken internal link: ${link.url}`,
        why: "Broken navigation damages UX, crawlability, and conversion.",
        fix: `Restore the route, redirect it, or update the link. Observed status: ${link.status || link.error}.`
      }))
    ],
    ["issue", "why", "fix"]
  )}

## 3. Performance Report

Problems:

${performance.map((item) => `- ${item}`).join("\n") || "- No obvious performance issue found by this lightweight check."}

Evidence:

- HTML bytes: ${htmlBytes}
- External scripts: ${parsed.externalScriptCount}
- Inline scripts: ${parsed.inlineScriptCount}
- Stylesheets: ${parsed.stylesheetCount}
- Images: ${parsed.imageCount}
- Images missing dimensions: ${parsed.missingDimensionsCount}
- Cache-Control: ${document.headers["cache-control"] ?? "missing"}

Fixes:

- Keep LCP assets small, preloaded only when they are truly critical, and served in WebP or AVIF when possible.
- Defer or remove non-critical JavaScript.
- Add explicit dimensions or CSS aspect ratios for images.
- Use long-lived caching for immutable hashed static assets.

## 4. Security Report

| Vulnerability | Risk Level | Fix |
| --- | --- | --- |
${tableRows(missingSecurity.map((finding) => ({
    vulnerability: finding.issue,
    risk: finding.risk,
    fix: finding.fix
  })), ["vulnerability", "risk", "fix"])}

Observed headers:

- Strict-Transport-Security: ${document.headers["strict-transport-security"] ?? "missing"}
- Content-Security-Policy: ${document.headers["content-security-policy"] ? "present" : "missing"}
- X-Content-Type-Options: ${document.headers["x-content-type-options"] ?? "missing"}
- Referrer-Policy: ${document.headers["referrer-policy"] ?? "missing"}
- Permissions-Policy: ${document.headers["permissions-policy"] ?? "missing"}
- X-Frame-Options: ${document.headers["x-frame-options"] ?? "missing"}

## 5. SEO Report

Issues:

${seo.map((item) => `- ${item}`).join("\n") || "- No obvious SEO metadata issue found by this lightweight check."}

Evidence:

- Title: ${parsed.title || "missing"}
- Meta description: ${parsed.description || "missing"}
- Canonical: ${parsed.canonical || "missing"}
- H1 count: ${parsed.h1.length}
- H1 text: ${parsed.h1.map((item) => `\`${item}\``).join(", ") || "missing"}
- H2 count: ${parsed.h2.length}
- JSON-LD blocks: ${parsed.jsonLdCount}
- Open Graph complete: ${parsed.ogTitle && parsed.ogDescription && parsed.ogImage && parsed.ogUrl ? "yes" : "no"}
- Twitter card: ${parsed.twitterCard || "missing"}
- robots.txt status: ${robots.status}
- sitemap.xml status: ${sitemapDefault.status}

Fixes:

- Add unique title, description, canonical, one H1, useful H2s, Open Graph, Twitter card, and JSON-LD per indexable page.
- Keep sitemap URLs canonical and indexable only.
- Keep robots.txt permissive for public assets and explicit about private routes.

## 6. UX and Conversion

Problems:

${ux.map((item) => `- ${item}`).join("\n") || "- No obvious UX issue found by this lightweight check."}

Suggested improvements:

- Verify mobile navigation, form completion, CTA clarity, and trust signals manually.
- Run keyboard-only testing and contrast checks before launch.
- Capture screenshots for desktop and mobile in this audit folder.

## 7. Quick Wins

1. Add missing high-priority security headers.
2. Fix broken sampled assets and internal links.
3. Add or tighten title and meta description.
4. Add a canonical URL matching the final public URL.
5. Use exactly one clear H1.
6. Complete Open Graph and Twitter card metadata.
7. Add JSON-LD for Organization, Service, Product, Article, or WebSite where relevant.
8. Add width and height or aspect-ratio for images.
9. Add alt text to meaningful images.
10. Verify sitemap and robots.txt in Search Console before launch.

## 8. Advanced Improvements

- Add Lighthouse CI for browser-based Core Web Vitals regression checks.
- Add a crawler for full-site link, canonical, title, and description coverage.
- Add real-user monitoring for LCP, CLS, and INP.
- Add uptime checks, error tracking, and deployment rollback documentation.
- Add security header tests to production deployment checks.

## Redirect Chain

| Status | URL | Location | Time |
| --- | --- | --- | --- |
${document.redirects
    .map((hop) => `| ${hop.status} | ${escapeMarkdown(hop.url)} | ${escapeMarkdown(hop.location)} | ${hop.durationMs}ms |`)
    .join("\n")}

## Sampled Network Checks

### Assets

| Status | URL | Cache-Control |
| --- | --- | --- |
${assetResults
    .map((asset) => `| ${asset.status || "error"} | ${escapeMarkdown(asset.url)} | ${escapeMarkdown(asset.headers["cache-control"] ?? "")} |`)
    .join("\n") || "| none | none | none |"}

### Internal Links

| Status | URL |
| --- | --- |
${linkResults.map((link) => `| ${link.status || "error"} | ${escapeMarkdown(link.url)} |`).join("\n") || "| none | none |"}

### Sitemaps

| Status | URL |
| --- | --- |
${sitemapResults.map((sitemap) => `| ${sitemap.status || "error"} | ${escapeMarkdown(sitemap.url)} |`).join("\n") || "| none | none |"}
`;

  writeFileSync(join(folder, "report.md"), report);
  writeFileSync(join(folder, "network", "summary.json"), `${JSON.stringify({
    target: startUrl.href,
    finalUrl: finalUrl.href,
    status: document.response.status,
    redirects: document.redirects,
    headers: document.headers,
    robots: {
      url: robots.url,
      status: robots.status
    },
    sitemaps: sitemapResults,
    sampledAssets: assetResults,
    sampledInternalLinks: linkResults,
    parsed: {
      title: parsed.title,
      description: parsed.description,
      canonical: parsed.canonical,
      h1: parsed.h1,
      h2Count: parsed.h2.length,
      jsonLdCount: parsed.jsonLdCount,
      imageCount: parsed.imageCount,
      scriptCount: parsed.scriptCount,
      stylesheetCount: parsed.stylesheetCount
    },
    findings: {
      security: missingSecurity,
      seo,
      performance,
      ux
    },
    rating,
    score
  }, null, 2)}\n`);

  console.log(`Audit complete: ${join(folder, "report.md")}`);
  console.log(`Rating: ${rating} (${score}%)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
