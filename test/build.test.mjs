import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  extensionDirectory,
  readProject,
  rootDirectory,
} from "../scripts/project.mjs";
import {
  extractReleaseNotes,
  normalizeTag,
} from "../scripts/release-notes.mjs";

const requiredLocales = [
  "ar",
  "bn",
  "en",
  "es",
  "fr",
  "hi",
  "ja",
  "pt_BR",
  "ru",
  "ur",
  "zh_CN",
];

test("5個の権限不要なFirefox拡張機能を生成する", async () => {
  const { packageJson, fences } = await readProject();
  assert.equal(fences.length, 5);

  for (const fence of fences) {
    const manifest = JSON.parse(
      await readFile(
        path.join(extensionDirectory(fence.number), "manifest.json"),
        "utf8",
      ),
    );

    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.version, packageJson.version);
    assert.equal(manifest.browser_specific_settings.gecko.id, fence.id);
    assert.deepEqual(
      manifest.browser_specific_settings.gecko.data_collection_permissions
        .required,
      ["none"],
    );
    assert.equal(manifest.action.default_area, "navbar");
    assert.equal(manifest.action.default_icon, "icons/fence.svg");
    assert.equal("permissions" in manifest, false);

    const locales = await readdir(
      path.join(extensionDirectory(fence.number), "_locales"),
    );
    assert.deepEqual(locales.sort(), [...requiredLocales].sort());
    for (const locale of locales) {
      const messagesText = await readFile(
        path.join(
          extensionDirectory(fence.number),
          "_locales",
          locale,
          "messages.json",
        ),
        "utf8",
      );
      const messages = JSON.parse(messagesText);
      assert.deepEqual(Object.keys(messages).sort(), [
        "actionTitle",
        "extensionDescription",
        "extensionName",
      ]);
      assert.equal(messagesText.includes("{{NUMBER}}"), false);
    }
  }
});

test("生成された拡張機能IDはすべて一意である", async () => {
  const { fences } = await readProject();
  assert.equal(new Set(fences.map(({ id }) => id)).size, 5);
});

test("フェンスSVGはライトテーマとダークテーマに対応する", async () => {
  const svg = await readFile(
    path.join(rootDirectory, "src", "icons", "fence.svg"),
    "utf8",
  );
  assert.match(svg, /prefers-color-scheme:\s*dark/);
  assert.match(svg, /<rect class="fence"/);
});

test("リリースノートは指定バージョンの範囲だけを抽出する", () => {
  const changelog = `# 変更履歴

## [Unreleased]

### Added

- 次回

## [1.0.0] - 2026-09-02

### Added

- 初回

## [0.9.0] - 2026-09-01

- 以前

[Unreleased]: https://example.com/compare/v1.0.0...HEAD
[1.0.0]: https://example.com/releases/v1.0.0
`;
  assert.equal(extractReleaseNotes(changelog, "1.0.0"), "### Added\n\n- 初回");
  assert.equal(normalizeTag("v1.0.0"), "1.0.0");
  assert.throws(() => normalizeTag("1.0.0"));
});
