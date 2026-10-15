# AGENTS.md

## 作業開始前の必須手順（最優先・例外なし）

1. エージェントは、調査、計画、コマンド実行、スキル利用、ファイル編集、コミット、プッシュを始める前に、必ずリポジトリ直下の `.\COMMON-AGENTS.md` を開き、先頭から末尾まで全文を読む。
2. `COMMON-AGENTS.md` はGit管理外のシンボリックリンクである。`git`や既定のignore設定が有効な`rg --files`の検索結果だけで、ファイルが存在しないと判断してはならない。PowerShellでは最初に次を実行する。

```powershell
Get-Content -Raw -LiteralPath .\COMMON-AGENTS.md
```

3. 読み取りに失敗した場合、出力が省略された場合、または末尾まで読めたことを確認できない場合は、一切の作業を開始せず、パスとシンボリックリンク先を確認して全文を再取得する。必要なら分割して末尾まで読む。
4. 全文を読了するまで、ローカル `AGENTS.md` だけを根拠に作業を続けてはならない。読了後は `COMMON-AGENTS.md` を最優先の指針とし、読了直後の最初の進捗報告で全文を読了したことを明示する。
   このファイルでは `firefox-icon-fences` 固有の補足だけを記載する。

## 目的
- Firefox Web Extensionでアイコンを種類別に区切るためのFencesを5個作る
- AMOで公開はしない
- リリースでSigned Extensionを公開してFirefox Stableにインストール可能にする

## 依存監査の上流制約（2026-10-15確認）

- 最新web-ext 10.7.0はadbkit 3.3.9を介してnode-forge 1.4.0へ依存する。GHSA-86w9-cpqp-85rvは修正版未公開であり、監査成功扱いにしない。web-extはlint・XPI生成・Mozilla署名にも必要なので、監査回避のため削除しない。npm auditのweb-ext 5.1.0降格提案は現行機能の互換性が保証されないため採用しない。公式修正版または依存経路を除去した上流版を確認して更新し、全チェック後に取り込む。
- web-extがfx-runner 1.6.0を固定しているため、`overrides.web-ext.fx-runner` でMozilla公式の1.7.0を指定し、shell-quoteの脆弱性を解消する。公式の1.6.0...1.7.0差分では実装APIの変更がなく、実行時依存の変更はshell-quote 1.11.0への更新だけ。web-ext更新時はこの固定が不要になったか確認する。詳細と根拠は `verification.md` を参照。
