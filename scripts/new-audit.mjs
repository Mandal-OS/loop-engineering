import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = process.argv[2];

if (!target) {
  console.error("Usage: npm run audit:new -- https://example.com");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(target);
} catch {
  console.error(`Invalid URL: ${target}`);
  process.exit(1);
}

if (!["http:", "https:"].includes(parsed.protocol)) {
  console.error("Audit URL must use http or https.");
  process.exit(1);
}

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");
const host = parsed.hostname.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
const folder = join(root, "audits", `${today}-${host}`);

mkdirSync(join(folder, "screenshots"), { recursive: true });
mkdirSync(join(folder, "lighthouse"), { recursive: true });
mkdirSync(join(folder, "network"), { recursive: true });

const report = `# ${parsed.hostname} Audit

Target: ${parsed.href}
Date: ${today}

## 1. Executive Summary

- Overall rating:
- Top 3 strengths:
- Top 5 critical issues:
- Launch readiness score:

## 2. Critical Issues

| Issue | Why It Matters | Exact Fix | Owner | Status |
| --- | --- | --- | --- | --- |
| | | | | |

## 3. Performance Report

- LCP:
- CLS:
- INP:
- JavaScript weight:
- CSS blocking:
- Image optimization:
- Font loading:
- CDN and cache headers:

## 4. Security Report

| Vulnerability | Risk | Evidence | Fix |
| --- | --- | --- | --- |
| | | | |

## 5. SEO Report

- Titles and descriptions:
- Canonicals:
- Headings:
- Schema:
- Open Graph and Twitter cards:
- Sitemap and robots:
- Internal linking:

## 6. UX and Conversion

- Mobile usability:
- Accessibility:
- CTA clarity:
- Trust signals:
- User flow friction:

## 7. Quick Wins

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

## 8. Advanced Improvements

- Scaling recommendations:
- Architecture improvements:
- Monitoring and operations:

## Evidence

- Screenshots: ./screenshots/
- Lighthouse: ./lighthouse/
- Network exports: ./network/
`;

writeFileSync(join(folder, "report.md"), report);
writeFileSync(join(folder, "README.md"), `# Audit Evidence

Target: ${parsed.href}

Place screenshots, Lighthouse exports, crawl output, network logs, and supporting evidence in this folder.
`);

console.log(`Created audit workspace: ${folder}`);
