# 変更履歴

このプロジェクトの重要な変更はこのファイルに記録します。書式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に従います。

## [Unreleased]

### Fixed

- CI と Dependabot の分類の実行順が前後しても更新を取りこぼさないよう、同じ PR 番号と head SHA を再照合する経路を追加した。

### Changed

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
