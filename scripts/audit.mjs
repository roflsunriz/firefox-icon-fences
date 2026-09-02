import { spawnSync } from "node:child_process";
import { readProject } from "./project.mjs";

const allowedAdvisoryIds = new Set([1138808, 1138809]);
const allowedAffectedPackages = new Set([
  "addons-linter",
  "image-size",
  "web-ext",
]);

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

const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const affectedPackages = new Set(vulnerabilities.map(({ name }) => name));
const advisoryIds = new Set(
  vulnerabilities.flatMap(({ via }) =>
    via
      .filter((item) => typeof item === "object" && item !== null)
      .map(({ source }) => source),
  ),
);
const unexpectedPackages = [...affectedPackages].filter(
  (name) => !allowedAffectedPackages.has(name),
);
const unexpectedAdvisories = [...advisoryIds].filter(
  (id) => !allowedAdvisoryIds.has(id),
);

if (result.status !== 0 && vulnerabilities.length === 0) {
  throw new Error(`npm audit が終了コード ${result.status} で失敗しました。`);
}

if (unexpectedPackages.length || unexpectedAdvisories.length) {
  process.stderr.write(result.stdout);
  throw new Error(
    `未承認の脆弱性を検出しました。packages=${unexpectedPackages.join(",") || "なし"}, advisories=${unexpectedAdvisories.join(",") || "なし"}`,
  );
}

if (vulnerabilities.length === 0) {
  console.log("npm audit: 脆弱性は検出されませんでした。");
} else {
  console.warn(
    "npm audit: image-sizeの未修正版DoS 2件だけを確認しました。管理下のSVGのみを検査し、配布物には依存関係を含めません。",
  );
}
