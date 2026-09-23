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

## Dependabot PR の更新

前提は `.github/dependabot.yml` と PR 用 CI（Quality）です。更新 PR の head SHA と `gh pr checks <PR番号>` の結果を確認してください。patch／minor は全チェック成功後に自動取り込みされます。初回 CI 失敗は failed jobs のみを 1 回再実行し、再失敗した PR は残して手動で修正します。

設定を変えたときは `actionlint .github/workflows/dependabot-automation.yml` と実際の PR の Actions 結果を確認します。問題があれば呼び出し先の共通 workflow SHA を直前の検証済み値へ戻すコミットを push します。取り込まれた依存更新に問題があれば通常の revert コミットで復旧します。

CI 完了より Dependabot の分類が遅れる場合は、`callback_workflow_file` が指す呼び出し側 workflow を `workflow_dispatch` し、同じ PR 番号・head SHA・全チェックを再確認する。呼び出し側のファイル名を変える際はこの入力も一緒に更新する。
