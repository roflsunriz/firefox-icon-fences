# 更新手順

## 前提

- Node.js 22以降とnpm
- GitHubリポジトリの書き込み権限
- AMO（addons.mozilla.org）のJWT issuerとJWT secret
- GitHub Actions Secrets `WEB_EXT_API_KEY` と `WEB_EXT_API_SECRET`

## 実装と検証

1. `package.json` の `version` を次のSemVerへ更新します。
2. 必要なソース、ロケール、設定を変更します。
3. `CHANGELOG.md` の `Unreleased` に目的と利用者への影響を記録します。
4. 次を実行します。

```powershell
npm ci
npm run check
```

5. [verification.md](verification.md) の手動確認を行います。

## リリース

1. `CHANGELOG.md` の変更を `## [X.Y.Z] - YYYY-MM-DD` へ移し、比較リンクを更新します。
2. 日本語Conventional Commits形式でコミットし、`main` へプッシュします。
3. `package.json` と同じバージョンのタグを作成してプッシュします。

```powershell
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

4. GitHub Actionsの「Release signed extensions」が成功したことを確認します。ワークフローは5個の拡張機能をAMOの `unlisted` チャネルで署名し、`CHANGELOG.md` の該当バージョンを本文としてGitHub Releaseを作成します。
5. Releaseに同じバージョンの署名済みXPIが5個だけ存在することを確認します。
6. Firefox Stableで各XPIを「ファイルからアドオンをインストール」し、5本すべてを配置できることを確認します。

## ロールバックと復旧

- リリース前の不具合は修正コミットを追加し、同じタグを使い回さずバージョンを上げます。
- 公開後に問題が判明した場合はReleaseへ注意事項を追記し、修正版を新しいバージョンとして署名・公開します。既存タグや署名済みXPIを置き換えません。
- 利用者は `about:addons` から問題のあるフェンスを削除し、必要なら直前のReleaseのXPIを再インストールできます。
