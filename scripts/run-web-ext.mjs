import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  distDirectory,
  extensionDirectory,
  readProject,
  releaseFilename,
  webExtExecutable,
} from "./project.mjs";

const command = process.argv[2];
if (!new Set(["lint", "build"]).has(command)) {
  throw new Error("引数には lint または build を指定してください。");
}

const { packageJson, fences } = await readProject();
const artifactsDirectory = path.join(distDirectory, "unsigned");
if (command === "build") {
  await rm(artifactsDirectory, { recursive: true, force: true });
  await mkdir(artifactsDirectory, { recursive: true });
}

for (const fence of fences) {
  const sourceDirectory = extensionDirectory(fence.number);
  const args = [command, "--source-dir", sourceDirectory];

  if (command === "lint") {
    args.push("--warnings-as-errors");
  } else {
    args.push(
      "--artifacts-dir",
      artifactsDirectory,
      "--filename",
      releaseFilename(fence.number, packageJson.version),
      "--overwrite-dest",
    );
  }

  runWebExt(args);
}

if (command === "build") {
  const actualFilenames = (await readdir(artifactsDirectory))
    .filter((name) => name.endsWith(".xpi"))
    .sort();
  const expectedFilenames = fences
    .map(({ number }) => releaseFilename(number, packageJson.version))
    .sort();
  if (JSON.stringify(actualFilenames) !== JSON.stringify(expectedFilenames)) {
    throw new Error("検証用XPIが想定どおり5個生成されませんでした。");
  }
}

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
      `web-ext ${command} が終了コード ${result.status} で失敗しました。`,
    );
  }
}
