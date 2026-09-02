import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const distDirectory = path.join(rootDirectory, "dist");
export const generatedExtensionsDirectory = path.join(
  distDirectory,
  "extensions",
);
export const webExtExecutable = path.join(
  rootDirectory,
  "node_modules",
  "web-ext",
  "bin",
  "web-ext.js",
);

export async function readJson(relativePath) {
  const contents = await readFile(
    path.join(rootDirectory, relativePath),
    "utf8",
  );
  return JSON.parse(contents);
}

export async function readProject() {
  const [packageJson, fences] = await Promise.all([
    readJson("package.json"),
    readJson("config/fences.json"),
  ]);

  validateFences(fences);
  return { packageJson, fences };
}

export function extensionDirectory(number) {
  return path.join(generatedExtensionsDirectory, `fence-${number}`);
}

export function releaseFilename(number, version) {
  return `icon-fence-${number}-${version}.xpi`;
}

function validateFences(fences) {
  if (!Array.isArray(fences) || fences.length !== 5) {
    throw new Error("config/fences.json には5個のフェンスが必要です。");
  }

  const numbers = fences.map(({ number }) => number);
  const ids = fences.map(({ id }) => id);
  const expectedNumbers = [1, 2, 3, 4, 5];

  if (numbers.some((number, index) => number !== expectedNumbers[index])) {
    throw new Error("フェンス番号は1から5まで順番に指定してください。");
  }

  if (new Set(ids).size !== ids.length) {
    throw new Error("拡張機能IDはフェンスごとに一意である必要があります。");
  }

  const extensionIdPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/;
  if (ids.some((id) => !extensionIdPattern.test(id))) {
    throw new Error(
      "拡張機能IDはMozilla推奨のメールアドレス形式にしてください。",
    );
  }
}
