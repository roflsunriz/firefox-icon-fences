# 変更履歴

このプロジェクトの重要な変更はこのファイルに記録します。書式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に従います。

## [Unreleased]

### Fixed

- Quality workflowのPrettier検査がDependabot自動化workflowのYAML書式で失敗しないよう、文字列の引用形式を整形。
- CI と Dependabot の分類の実行順が前後しても更新を取りこぼさないよう、同じ PR 番号と head SHA を再照合する経路を追加した。

### Changed

- 不具合・機能提案などの受付とPRの記入形式を揃え、プロジェクト固有の確認項目を残した。 READMEは既存の意味と手順を保ち、実装と異なる説明や読みにくい表現を修正した。

- CIのPrettier検査を含む開発確認を最新の修正版で行えるよう、Prettierを3.9.9へ更新。
- 依存更新を安全に省力化するため、Dependabot の patch／minor PR を既存 CI の全チェック成功後に自動取り込みし、失敗ジョブを一度再実行する設定を追加した。
- 開発依存関係の脆弱性監査を通すため、`web-ext` と脆弱性が報告された推移依存を修正版へ更新しました。
- 既知の脆弱性を例外扱いしていた監査を、検出した脆弱性をすべて失敗として扱うように変更しました。

## [1.0.0] - 2026-09-02

### Added

- Firefoxのツールバーアイコンを5グループに区切れるように、一意な拡張機能IDを持つ5本の移動可能なアイコンフェンスを追加しました。
- ライトテーマとダークテーマの双方で区切り線を判別できるSVGアイコンを追加しました。
- 日本語を含む主要11ロケールの拡張機能名、説明、ツールチップを追加しました。
- 未掲載のAMO署名を経た5個のXPIだけをGitHub Releasesへ公開するリリースワークフローを追加しました。

[Unreleased]: https://github.com/roflsunriz/firefox-icon-fences/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/roflsunriz/firefox-icon-fences/releases/tag/v1.0.0
