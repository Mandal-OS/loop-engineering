import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scriptsDir = join(root, "scripts");
const scripts = readdirSync(scriptsDir)
  .filter((file) => file.endsWith(".mjs"))
  .sort();

for (const script of scripts) {
  const result = spawnSync(process.execPath, ["--check", join(scriptsDir, script)], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Script syntax check passed.");
