# コントリビューションガイド

IssueやPull Requestを歓迎します。変更前に既存Issueを確認し、大きな仕様変更はIssueで目的と利用者への影響を共有してください。

## 開発手順

1. Node.js 22以降を用意します。
2. `npm ci` を実行します。
3. 変更後に `npm run check` を実行します。
4. 利用者向け変更を `CHANGELOG.md` の `Unreleased` へ追記します。
5. コミットは日本語Conventional Commits形式にします。

新しい権限、外部通信、データ収集、バックグラウンド処理は、このプロジェクトの目的に反するため追加しないでください。フェンス数や拡張機能IDを変える場合は、既存利用者の更新経路と署名履歴への影響をIssueで説明してください。

## 報告・提案の受付

[Issueの受付](https://github.com/roflsunriz/firefox-icon-fences/issues/new/choose)から用途に合うフォームを選び、目的、対象と環境、確認できた結果を記載してください。Pull Requestには変更後の挙動、検証結果、未検証条件、互換性への影響を記載します。受付と秘密情報の扱いは[SUPPORT.md](SUPPORT.md)を参照してください。
