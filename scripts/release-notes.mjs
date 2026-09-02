import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readProject, rootDirectory } from "./project.mjs";

export function extractReleaseNotes(changelog, version) {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(
    `^## \\[${escapedVersion}\\](?: - \\d{4}-\\d{2}-\\d{2})?\\s*$`,
    "m",
  );
  const match = heading.exec(changelog);
  if (!match) {
    throw new Error(`CHANGELOG.md に ${version} の項目がありません。`);
  }

  const bodyStart = match.index + match[0].length;
  const rest = changelog.slice(bodyStart);
  const nextSection = rest.search(/^(?:## |\[[^\]]+\]:)/m);
  const body = (nextSection === -1 ? rest : rest.slice(0, nextSection)).trim();
  if (!body) {
    throw new Error(`CHANGELOG.md の ${version} にリリース内容がありません。`);
  }
  return body;
}

export function normalizeTag(tag) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
    throw new Error("リリースタグは v1.2.3 形式で指定してください。");
  }
  return tag.slice(1);
}

async function main() {
  const [tag, outputPath] = process.argv.slice(2);
  if (!tag || !outputPath) {
    throw new Error(
      "使用方法: node scripts/release-notes.mjs <vX.Y.Z> <出力ファイル>",
    );
  }

  const version = normalizeTag(tag);
  const { packageJson } = await readProject();
  if (packageJson.version !== version) {
    throw new Error(
      `タグ ${tag} と package.json のバージョン ${packageJson.version} が一致しません。`,
    );
  }

  const changelog = await readFile(
    path.join(rootDirectory, "CHANGELOG.md"),
    "utf8",
  );
  const notes = extractReleaseNotes(changelog, version);
  await writeFile(path.resolve(outputPath), `${notes}\n`, "utf8");
}

const entryPoint = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === entryPoint) {
  await main();
}
