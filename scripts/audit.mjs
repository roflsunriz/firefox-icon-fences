import { spawnSync } from "node:child_process";
import { readProject } from "./project.mjs";

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

if (result.status !== 0 && vulnerabilities.length === 0) {
  throw new Error(`npm audit が終了コード ${result.status} で失敗しました。`);
}

if (vulnerabilities.length > 0) {
  process.stderr.write(result.stdout);
  const packages = vulnerabilities.map(({ name }) => name).join(",");
  throw new Error(`脆弱性を検出しました。packages=${packages}`);
}

console.log("npm audit: 脆弱性は検出されませんでした。");
