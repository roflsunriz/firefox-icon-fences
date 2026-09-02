import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  distDirectory,
  extensionDirectory,
  readProject,
  releaseFilename,
  webExtExecutable,
} from "./project.mjs";

const apiKey = process.env.AMO_JWT_ISSUER;
const apiSecret = process.env.AMO_JWT_SECRET;
if (!apiKey || !apiSecret) {
  throw new Error(
    "AMO_JWT_ISSUER と AMO_JWT_SECRET の両方を環境変数へ設定してください。",
  );
}

const { packageJson, fences } = await readProject();
const signedDirectory = path.join(distDirectory, "signed");
const temporaryDirectory = path.join(distDirectory, "signing-output");
await Promise.all([
  rm(signedDirectory, { recursive: true, force: true }),
  rm(temporaryDirectory, { recursive: true, force: true }),
]);
await Promise.all([
  mkdir(signedDirectory, { recursive: true }),
  mkdir(temporaryDirectory, { recursive: true }),
]);

for (const fence of fences) {
  const fenceOutput = path.join(temporaryDirectory, `fence-${fence.number}`);
  await mkdir(fenceOutput, { recursive: true });
  runWebExt([
    "sign",
    "--source-dir",
    extensionDirectory(fence.number),
    "--artifacts-dir",
    fenceOutput,
    "--channel",
    "unlisted",
    "--no-input",
    "--api-key",
    apiKey,
    "--api-secret",
    apiSecret,
    "--approval-timeout",
    "600000",
  ]);

  const signedFiles = (await readdir(fenceOutput)).filter((name) =>
    name.endsWith(".xpi"),
  );
  if (signedFiles.length !== 1) {
    throw new Error(
      `フェンス${fence.number}の署名済みXPIが1個だけ生成されませんでした。`,
    );
  }

  await rename(
    path.join(fenceOutput, signedFiles[0]),
    path.join(
      signedDirectory,
      releaseFilename(fence.number, packageJson.version),
    ),
  );
}

await rm(temporaryDirectory, { recursive: true, force: true });
console.log(`${fences.length}個の署名済みXPIを dist/signed に配置しました。`);

function runWebExt(args) {
  const result = spawnSync(process.execPath, [webExtExecutable, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `web-ext sign が終了コード ${result.status} で失敗しました。`,
    );
  }
}
