# findings.md

firefox-icon-fences の実現手段、共通指針の適用条件と調査知見の正本。作業前に全文読む。利用者向けの導入・使用方法はREADME、更新の手順はhow-to-update.md、実施結果と未検証事項はverification.mdを参照する。移した記述の確認日・条件・留保は元のまま保持し、文書移動を再実測と解釈しない。

## 共通指針の適用条件と代替検証

- 対象の共通ルール: 設計と実装方針／検証
- 理由: 最小WebExtensionをNode.js/npmで生成しMozilla署名済みXPIとして配布する既存構成を使う。
- 適用範囲: 5本の拡張機能の生成、検証、署名
- 同等の品質を保つ手段・検証: package.jsonのcheck、node --test、web-ext lint/build、依存監査とFirefox Stableの署名済みXPI確認を使う。未修正の上流脆弱性は成功扱いせず以下とverification.mdで追跡する。

新たな免除や操作許可を追加するものではない。AGENTS.mdの禁止・承認条件と共通指針は引き続き有効。

<a id="agents-1"></a>

## 依存監査の上流制約（2026-10-15確認）

- 最新web-ext 10.7.0はadbkit 3.3.9を介してnode-forge 1.4.0へ依存する。GHSA-86w9-cpqp-85rvは修正版未公開であり、監査成功扱いにしない。web-extはlint・XPI生成・Mozilla署名にも必要なので、監査回避のため削除しない。npm auditのweb-ext 5.1.0降格提案は現行機能の互換性が保証されないため採用しない。公式修正版または依存経路を除去した上流版を確認して更新し、全チェック後に取り込む。
- web-extがfx-runner 1.6.0を固定しているため、`overrides.web-ext.fx-runner` でMozilla公式の1.7.0を指定し、shell-quoteの脆弱性を解消する。公式の1.6.0...1.7.0差分では実装APIの変更がなく、実行時依存の変更はshell-quote 1.11.0への更新だけ。web-ext更新時はこの固定が不要になったか確認する。詳細と根拠は `verification.md` を参照。

移動元: `AGENTS.md`。

<a id="readme-1"></a>

## 開発

Node.js 22以降が必要です。

```powershell
npm ci
npm run check
```

`npm run build` は5個の拡張機能ソースを `dist/extensions` に生成し、`npm run package` は未署名の検証用XPIを `dist/unsigned` に生成します。Firefox Stableへ恒久的にインストールできる配布物は、GitHub ActionsがMozilla Add-ons APIで署名したRelease上のXPIだけです。

詳しい更新・リリース方法は [how-to-update.md](how-to-update.md)、検証方法は [verification.md](verification.md) を参照してください。

移動元: `README.md`。

<a id="readme-2"></a>

## 依存更新の自動処理

Dependabot は対象の依存関係を毎週確認します。patch／minor 更新は PR のチェック（Quality）が成功した後に自動で squash merge されます。CI の失敗ジョブは 1 回だけ再実行します。再失敗した PR は残して手動で修正します。major 更新は手動で確認します。

移動元: `README.md`。

<a id="update-1"></a>

## Dependabot PR の更新

前提は `.github/dependabot.yml` と PR 用 CI（Quality）です。更新 PR の head SHA と `gh pr checks <PR番号>` の結果を確認してください。patch／minor は全チェック成功後に自動取り込みされます。初回 CI 失敗は failed jobs のみを 1 回再実行し、再失敗した PR は残して手動で修正します。

設定を変えたときは `actionlint .github/workflows/dependabot-automation.yml` と実際の PR の Actions 結果を確認します。問題があれば呼び出し先の共通 workflow SHA を直前の検証済み値へ戻すコミットを push します。取り込まれた依存更新に問題があれば通常の revert コミットで復旧します。

依存監査が失敗した場合は `npm run audit` と `npm ls <対象パッケージ>` で依存経路を確認し、公式レジストリとAdvisoryの修正版を照合します。互換範囲内の更新は `npm update --ignore-scripts` で適用します。現在の上流制約と一時的な `overrides` の理由・解除条件は [verification.md](verification.md) を参照してください。修正版が未公開の場合も監査を無効化せず、失敗と残るリスクを記録します。

CI 完了より Dependabot の分類が遅れる場合は、`callback_workflow_file` が指す呼び出し側 workflow を `workflow_dispatch` し、同じ PR 番号・head SHA・全チェックを再確認する。呼び出し側のファイル名を変える際はこの入力も一緒に更新する。

移動元: `how-to-update.md`。

<a id="verification-1"></a>

## Dependabot 自動処理（2026-09-23）

`.github/workflows/dependabot-automation.yml` を actionlint で検査し、PR 用 workflow 名（Quality）と一致することを確認する。Dependabot の patch／minor かつ全 PR チェック成功の場合だけ取り込み、major・古い SHA・再失敗は残す。

実際の Dependabot PR がまだない場合、動作経路は未検証として扱う。実 PR 発生後に自動化ジョブ、CI の再試行、マージ結果を確認する。

大量の Dependabot PR により CI 完了より分類が遅れる場合でも、分類後の `workflow_dispatch` が現在の PR 番号と head SHA を照合して再評価する。別の作成者、古い SHA、未完了の CI はマージしない。

移動元: `verification.md`。

## 関連文書

- [利用者向けREADME](README.md)
- [更新と復旧](how-to-update.md)
- [検証結果と未検証範囲](verification.md)
- [変更履歴](CHANGELOG.md)

## web-ext監査の再確認（2026-10-16）

公式npmメタデータではweb-ext 10.8.0が公開済みだが、引き続き@devicefarmer/adbkit 3.3.9へ依存する。node-forgeの最新は1.4.0で、GHSA-86w9-cpqp-85rvの影響範囲に残る。移動元にある10.7.0「最新」は当時の条件であり、現在の最新版を意味しない。監査を無効化・依存を削除せず、上流の修正版と依存経路を再確認する。
