import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoredDirs = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const markdownFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(join(dir, entry.name));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      markdownFiles.push(join(dir, entry.name));
    }
  }
}

walk(root);

const failures = [];
const markdownLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(markdownLinkPattern)) {
    let target = match[1].trim();

    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }

    if (
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:")
    ) {
      continue;
    }

    const [pathOnly] = target.split("#");
    if (!pathOnly) {
      continue;
    }

    const resolved = resolve(dirname(file), decodeURIComponent(pathOnly));
    const relativeTarget = relative(root, resolved);
    const relativeFile = relative(root, file);

    if (relativeTarget.startsWith("..") || isAbsolute(relativeTarget) || !existsSync(resolved)) {
      failures.push(`${relativeFile}: broken link to ${target}`);
      continue;
    }

    if (statSync(resolved).isDirectory()) {
      failures.push(`${relativeFile}: link points to a directory: ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Broken internal Markdown links found:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Markdown link check passed.");
