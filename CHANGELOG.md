# 変更履歴

このプロジェクトの重要な変更はこのファイルに記録します。書式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に従います。

## [Unreleased]

### Security

- 依存監査で deepmerge の全配置を照合し、未検証の追加コピーや異なる版、未知の不正な勧告を拒否するようにした。
- 開発用 node-forge を公開修正版 1.4.2 に更新し、従来のローカルパッチを外して署名構造の回帰検査を維持した。deepmerge には公開修正版まで限定パッチを適用し、minimatch 3 の実装と監査対象を検証する。raw警告と未知の指摘は引き続き可視化する。

### Changed

- GitHub Actions の月間利用時間を抑えるため、Dependabot version update と自動マージを毎週・即時処理から毎月28日（Asia/Tokyo）の月末一括処理へ変更した。

- 利用者向けの手順と開発知見を区別できるように、固有の実現手段・共通指針の適用条件・調査記録をfindings.mdへ本文を保って分離し、作業前の全文必読と文書間の参照を整えた。

- 不具合・機能提案などの受付とPRの記入形式を揃え、プロジェクト固有の確認項目を残した。 READMEは既存の意味と手順を保ち、実装と異なる説明や読みにくい表現を修正した。

- CIのPrettier検査を含む開発確認を修正版で行えるよう、Prettierを3.9.10へ更新。
- 依存更新を安全に省力化するため、Dependabot の patch／minor PR を既存 CI の全チェック成功後に自動取り込みし、失敗ジョブを一度再実行する設定を追加した。
- 開発依存関係の脆弱性監査を通すため、`web-ext` と脆弱性が報告された推移依存を修正版へ更新しました。
- 既知の脆弱性を例外扱いしていた監査を、検出した脆弱性をすべて失敗として扱うように変更しました。

### Security

- 開発ツールの既知の脆弱性を減らすため、brace-expansionとsource-map-jsを互換範囲内で更新し、web-extが使うfx-runnerをMozilla公式の1.7.0へ上書きしてshell-quoteを1.11.0へ更新した。修正版未公開のnode-forgeに由来する監査失敗は残る。
- 失敗した依存監査を誤って成功扱いしないよう、node-forgeの修正版未公開とweb-extの必要な利用経路を検証記録へ明記した。

### Fixed

- Quality workflowのPrettier検査がDependabot自動化workflowのYAML書式で失敗しないよう、文字列の引用形式を整形。
- CI と Dependabot の分類の実行順が前後しても更新を取りこぼさないよう、同じ PR 番号と head SHA を再照合する経路を追加した。

## [1.0.0] - 2026-09-02

### Added

- Firefoxのツールバーアイコンを5グループに区切れるように、一意な拡張機能IDを持つ5本の移動可能なアイコンフェンスを追加しました。
- ライトテーマとダークテーマの双方で区切り線を判別できるSVGアイコンを追加しました。
- 日本語を含む主要11ロケールの拡張機能名、説明、ツールチップを追加しました。
- 未掲載のAMO署名を経た5個のXPIだけをGitHub Releasesへ公開するリリースワークフローを追加しました。

[Unreleased]: https://github.com/roflsunriz/firefox-icon-fences/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/roflsunriz/firefox-icon-fences/releases/tag/v1.0.0
