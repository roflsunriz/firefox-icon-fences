import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { readProject } from "./project.mjs";
import { validateAuditReport } from "./audit-policy.mjs";
import { sha256, verifyDeepmerge } from "./deepmerge-security.mjs";

const npmExecutable = process.env.npm_execpath;
if (!npmExecutable) {
  throw new Error("npm経由で npm run audit を実行してください。");
}

const { packageJson } = await readProject();
if (
  packageJson.dependencies?.["web-ext"] ||
  !packageJson.devDependencies?.["web-ext"]
) {
  throw new Error(
    "web-ext は配布物へ含めずdevDependenciesだけに置いてください。",
  );
}

verifyDeepmerge();
const require = createRequire(import.meta.url);
assert.equal(
  JSON.parse(readFileSync(require.resolve("node-forge/package.json"), "utf8"))
    .version,
  "1.4.2",
);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const minimatches = Object.entries(lock.packages).filter(([path]) =>
  /(^|\/)node_modules\/minimatch$/.test(path),
);
assert.ok(minimatches.length > 0, "minimatch lock information is missing");
for (const [directory, entry] of minimatches) {
  assert.equal(entry.version, "3.1.5", `unreviewed minimatch: ${directory}`);
  assert.equal(
    JSON.parse(readFileSync(join(directory, "package.json"), "utf8")).version,
    "3.1.5",
  );
  assert.equal(
    sha256(join(directory, "minimatch.js")),
    "746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d",
  );
}
const regression = spawnSync(
  process.execPath,
  [
    "--test",
    "scripts/node-forge-regression.mjs",
    "scripts/dependency-security.test.mjs",
    "scripts/audit-policy.test.mjs",
  ],
  { encoding: "utf8" },
);
if (regression.error) throw regression.error;
process.stdout.write(regression.stdout);
process.stderr.write(regression.stderr);
assert.equal(regression.status, 0, "dependency regression failed");

const result = spawnSync(process.execPath, [npmExecutable, "audit", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
if (result.error) {
  throw result.error;
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  process.stderr.write(result.stderr || result.stdout);
  throw new Error("npm audit のJSON出力を解析できませんでした。");
}

if (report.error) {
  throw new Error(`npm audit の実行に失敗しました: ${report.error.summary}`);
}

validateAuditReport(report, result.status);
if (Object.keys(report.vulnerabilities).length > 0)
  process.stdout.write(result.stdout);
console.log(
  "deepmerge patch and minimatch 3 implementation verified; other advisories fail the audit.",
);
