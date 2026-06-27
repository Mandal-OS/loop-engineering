import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoredDirs = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const ignoredFiles = new Set(["package-lock.json"]);

const patterns = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{30,}/g },
  { name: "GitHub fine-grained token", regex: /github_pat_[A-Za-z0-9_]{22,}/g },
  { name: "npm token", regex: /npm_[A-Za-z0-9]{36}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{35}/g },
  { name: "Slack token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/g },
  { name: "Discord webhook", regex: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g },
  { name: "Stripe live secret", regex: /sk_live_[A-Za-z0-9]{20,}/g },
  { name: "OpenAI-style secret", regex: /\bsk-[A-Za-z0-9]{32,}\b/g },
  { name: "Private key block", regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g }
];

const findings = [];

function isProbablyText(buffer) {
  const sample = buffer.subarray(0, 1024);
  return !sample.includes(0);
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }

    if (!entry.isFile() || ignoredFiles.has(entry.name)) {
      continue;
    }

    const buffer = readFileSync(fullPath);
    if (buffer.length > 1024 * 1024) {
      continue;
    }

    if (!isProbablyText(buffer)) {
      continue;
    }

    const content = buffer.toString("utf8");
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        findings.push(`${relative(root, fullPath)}: ${pattern.name}`);
      }
      pattern.regex.lastIndex = 0;
    }
  }
}

walk(root);

if (findings.length > 0) {
  console.error("Potential secrets found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Secret pattern check passed.");
