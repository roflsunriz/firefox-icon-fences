import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const packageDirectory = dirname(require.resolve("deepmerge/package.json"));
const expectedPatch =
  "c2602592399c77c7dcf4dde55e869c73761a4b022551a235eef4dbb7c888a468";
const files = {
  "index.js": [
    "12440c84957c1990ea2d5e33dc0091722dc1dc1585c6d20e0c780e568ffa9d30",
    "48fd88a90e90ba6fe45487d529a9ab4fda2c67c6d44e53f85067ace7064f739b",
  ],
  "dist/cjs.js": [
    "2e5160f84a1141bd927264afe4d15766f1e6cf07daef182b37ff53fea121de7d",
    "218a3a994f126ee0ae64e9e58d8b315bb01ba1cb096c696118da27212b1c1cbe",
  ],
  "dist/umd.js": [
    "f33e6596482d1fb5c7c427f8ef92f2aa849eea9223acd974176b2fb27ddbf73a",
    "74f72617d80ed4d1edad4a0b72ad3305da87da855e7fa825ad2a93f8beea8735",
  ],
};
export function sha256(path) {
  return createHash("sha256")
    .update(readFileSync(path, "utf8").replace(/\r\n/g, "\n"))
    .digest("hex");
}
function verifyIdentity() {
  const patch = new URL("../patches/deepmerge@4.3.1.patch", import.meta.url);
  assert.equal(sha256(patch), expectedPatch, "deepmerge patch hash mismatch");
  assert.equal(
    JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"))
      .version,
    "4.3.1",
    "deepmerge version must be re-evaluated",
  );
}
export function verifyDeepmerge() {
  verifyIdentity();
  for (const [file, [, patched]] of Object.entries(files)) {
    assert.equal(
      sha256(join(packageDirectory, file)),
      patched,
      `unpatched deepmerge: ${file}`,
    );
  }
}
export function applyDeepmerge() {
  verifyIdentity();
  for (const [file, [original, patched]] of Object.entries(files)) {
    const path = join(packageDirectory, file);
    const current = sha256(path);
    if (current === patched) continue;
    assert.equal(current, original, `unexpected deepmerge source: ${file}`);
    let source = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
    const target =
      /(getKeys\(target\)\.forEach\(function\(key\) \{\n)([\t ]*)destination\[key\]/g;
    const input =
      /(getKeys\(source\)\.forEach\(function\(key\) \{\n)([\t ]*)if \(propertyIsUnsafe/g;
    assert.equal([...source.matchAll(target)].length, 1);
    assert.equal([...source.matchAll(input)].length, 1);
    source = source.replace(
      target,
      "$1$2if (key === '__proto__') return\n$2destination[key]",
    );
    source = source.replace(
      input,
      "$1$2if (key === '__proto__') return\n$2if (propertyIsUnsafe",
    );
    assert.equal(
      createHash("sha256").update(source).digest("hex"),
      patched,
      `patch mismatch: ${file}`,
    );
    writeFileSync(path, source);
  }
  verifyDeepmerge();
}
