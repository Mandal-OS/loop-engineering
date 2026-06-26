import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CHANGELOG.md",
  "LICENSE.md",
  "docs/repository-setup.md",
  "docs/launch-readiness.md",
  "docs/performance-budget.md",
  "docs/security-baseline.md",
  "docs/seo-playbook.md",
  "docs/conversion-playbook.md",
  "docs/architecture.md",
  "docs/audit-template.md"
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));

if (missing.length > 0) {
  console.error("Missing required repository files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const readme = readFileSync(join(root, "README.md"), "utf8");
const requiredReadmeSections = [
  "## Status",
  "## What This Repo Includes",
  "## Repository Map",
  "## Quick Start",
  "## Launch Standard",
  "## GitHub Setup"
];

const missingSections = requiredReadmeSections.filter((section) => !readme.includes(section));

if (missingSections.length > 0) {
  console.error("README.md is missing required sections:");
  for (const section of missingSections) {
    console.error(`- ${section}`);
  }
  process.exit(1);
}

console.log("Documentation check passed.");
