import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checks = [
  "scripts/check-scripts.mjs",
  "scripts/check-docs.mjs",
  "scripts/check-links.mjs",
  "scripts/check-secrets.mjs"
];

for (const check of checks) {
  const result = spawnSync(process.execPath, [join(root, check)], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Repository checks passed.");
