# 検証手順

## 2026-10-31: Dependabot 更新と依存監査

- web-ext 10.8.0 が fx-runner 1.7.0 を直接指定するため override を除いた。node-forge は公開修正版 1.4.2 に更新し、正常な署名構造の受理と不正な要素の拒否を確認した。
- deepmerge 4.3.1 の限定パッチと攻撃回帰、minimatch 3.1.5 のソース・非増幅を検証する。raw監査は2件とその依存経路を表示し、未知の警告や検証の不一致は拒否する。
- lockfile内のdeepmerge全配置を確認し、未検証の追加コピーや別名、版の違い、欠落、URLを欠く未知の勧告を監査で拒否する回帰を追加した。
- `npm run check` で整形、生成、回帰テスト、5拡張の `web-ext lint` と未署名XPI生成が成功した。隔離したheadless Firefoxの一時プロファイルでも5個すべてを一時インストールし、有効化を確認した。署名済みXPIの配布とツールバー配置の手動操作は実施していない。

## 自動検証

開発ツールのバージョンは `package.json` と `package-lock.json` を正本とします。依存更新時は `npm ci` 後に `npm run check` を実行し、限定パッチと監査判定を含む品質確認がすべて成功することを確認してください。

2026-09-28時点で `npm ci` は `web-ext` 10.7.0 → `addons-linter` 10.13.0 が固定する ESLint 9.39.4 の非推奨警告を出します。両パッケージにそれより新しい公開版はなく、`npm audit` は脆弱性0件でした。互換性未確認のoverrideは加えず、上流の更新時に再確認します。

```powershell
npm ci
npm run check
```

`npm run check` は次を確認します。

- ソースとドキュメントのフォーマット
- フェンスが正確に5個生成され、番号と拡張機能IDが一意であること
- Manifest V3、権限なし、データ収集なし、ツールバー初期配置であること
- 日本語を含む11ロケールが揃い、未置換のテンプレート値がないこと
- SVGがライト／ダークテーマへ対応していること
- `web-ext lint` が5個すべて警告なしで成功すること
- 未署名の検証用XPIが5個生成できること
- raw監査結果を表示し、検証済みのdeepmerge・minimatchの対象2件以外に警告がないこと

`npm run audit` はnpmの脆弱性データベースを使い、deepmergeのパッチと攻撃回帰、minimatch 3の実装と非増幅を確認して対象2件を限定判定します。未知の警告・版やハッシュの変化・監査の実行失敗は拒否します。

GitHub ActionsのQuality workflowはDependabot自動化workflowもPrettierの対象に含めます。YAMLを変更した場合は `npm run format:check` を含む `npm run check` を実行します。

2026-09-28のPrettier 3.9.9更新後は書式検査、生成ビルド、4件のNodeテスト、5拡張の `web-ext lint` とXPI生成、脆弱性監査が成功し、`npm outdated`は空でした。

## 署名済みXPIの確認

GitHub Actionsのリリース実行では、以下も確認します。

- タグと `package.json` のバージョンが一致すること
- `CHANGELOG.md` に該当バージョンの本文があること
- AMOの `unlisted` 署名が5個すべて成功すること
- 各XPIにMozilla署名用の `META-INF/mozilla.rsa` が含まれること
- Releaseへ署名済みXPIが5個だけ添付されること

## Firefox Stableでの手動確認

1. 検証専用プロファイルでFirefox Stableを起動します。
2. ReleaseのXPIを5個すべてインストールでき、署名エラーが表示されないことを確認します。
3. 5本すべてがツールバーまたはカスタマイズ画面に現れることを確認します。
4. 各フェンスを別々にドラッグし、配置が独立して保存されることを確認します。
5. ツールバーの通常密度、タッチ密度、狭いウィンドウ、オーバーフローメニューで欠けや重なりがないことを確認します。
6. Firefoxのライトテーマ、ダークテーマ、システムテーマで線が判別できることを確認します。
7. 日本語と英語で、アドオン名、説明、ツールチップが正しく表示されることを確認します。
8. フェンスをクリックしてもページ、タブ、通信、設定が変化しないことを確認します。
9. Firefoxを再起動し、配置が保持されることを確認します。
10. 5個を削除し、ツールバーからすべて消えることを確認します。

実利用プロファイルで確認した場合は、検証後に不要な設定変更が残っていないことも確認します。

## Dependabot 自動処理（2026-09-23）

詳細は [findings.md](findings.md#verification-1) に移しました。

## 2026-10-05: GitHub受付・READMEの整備（公開前）

- 比較元: `ee392418f46995f0d2ffe69f6eb86343725f4e73`（`main`）。
- 受付フォーム 6 件のYAML構造、重複キー・ID、入力型、選択肢、予約ファイル名を一括検査し、エラー0件。
- 既存の固有質問・入力例・必須条件を原文と照合。READMEのリンク・画像・コマンド・条件を確認し、裏付けがある誤記だけを訂正した。
- 既存のCI、Dependabot、labeler、ライセンスのファイル内容は比較元から変更していない。
- 製品のビルド・インストール・実機操作、GitHub上のフォーム表示、公開後CIは今回の静的検証に含めない。公開後に実際の受付表示と必要ラベルの適用を確認する。

## 2026-10-05 マージ後CIの再監査

旧文書PRは依存監査が失敗したheadでマージされ、mainでも監査が失敗した。現在の最新web-ext 10.7.0、adbkit 3.3.9、node-forge 1.4.0にも同じ経路が存在する。公式GitHub Advisoryは修正版なしと明記している: https://github.com/advisories/GHSA-86w9-cpqp-85rv 。監査抑制、チェック削除、古いweb-extへの強制降格は行わない。web-extのlint・XPI生成・Mozilla署名の利用経路を維持する。最小案はnode-forge修正版またはweb-ext/adbkitの依存除去版を待って更新し、監査と既存全チェックを再実行すること。

`npm run check`の整形・ビルド・4件のテスト・5個の拡張lint/未署名XPI生成は成功し、監査だけが失敗する。brace-expansion警告は解消し、node-forgeに由来する3パッケージのhigh警告が残る。署名APIへの送信は行っていない。

## 2026-10-15: Open PRの依存監査の再確認

- npm公式レジストリと [GitHub Advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) を再確認した。web-ext 10.7.0、adbkit 3.3.9、node-forge 1.4.0が引き続き最新公開版で、node-forgeの修正版は未公開。[上流の修正PR #1152](https://github.com/digitalbazaar/forge/pull/1152) も未マージであり、未採用の暗号処理修正を独自に取り込まない。
- `npm update --ignore-scripts` でbrace-expansion 1.1.21、source-map-js 1.2.2など互換範囲内の推移依存を更新した。web-extがfx-runner 1.6.0を固定するため、`overrides.web-ext.fx-runner` に1.7.0を指定した。[Mozilla公式差分](https://github.com/mozilla/node-fx-runner/compare/1.6.0...1.7.0) で実装APIの変更がないことを確認し、shell-quote 1.11.0への更新でcriticalの指摘を解消した。監査抑制やweb-extの削除・降格は行わない。
- 残る監査失敗はnode-forgeとその親依存adbkit、web-extの計3パッケージ（high）。上流修正版または依存経路を除去した公式版の公開後、依存を更新して `npm ci` と `npm run check` を再実行する。fx-runnerの上書きはweb-extが修正版を採用した時点で取り除く。
- ローカルのNode.js 26.4.0／npm 11.17.0で `npm ci --ignore-scripts` と `npm run check` を実行した。書式、生成ビルド、4件のNodeテスト、5個の拡張lint（警告0件）と未署名XPI生成は成功し、最後の監査で上記3パッケージのhighを検出して失敗した。製品ソースや拡張機能の権限は変更していない。Mozillaへの署名申請とFirefoxへのインストールは今回の依存更新検証には含めない。
- Prettier 3.9.10を含むPR #6の構成でも `npm ci` 後に同じ全検査を実行し、監査以外は成功した。`npm outdated --json` は空だった。通常の依存インストールは成功するが、上流が固定するESLint 9.39.4とwhatwg-encoding 3.1.1の非推奨警告は残る。

## 2026-10-16: findings.mdへの知見分離

- 目的: 共通指針に合わせ、AGENTSの行動指示と利用者向けREADMEから、開発内部の実現手段・例外の条件・再利用する調査知見をfindings.mdへ分離した。移動した本文の条件・確認日・未検証の留保を保持した。
- 元文書との本文照合、Markdownの相対リンク・見出しアンカーの検査、git diff --checkを実施し、新たなリンク不整合と空白エラーは0件。AGENTSの一般的な指示は内容を保って再編し、findings全文必読・禁止と承認条件を確認した。
- GitHubの既存Dependabot警告を読み取り、Open PRも確認した（作業開始時Open PR 0件、Open警告 1件）。GitHubの警告なしを全依存の安全保証や実機動作の検証とは扱わない。
- ローカル監査はGHSA-86w9-cpqp-85rv（node-forge 1.4.0）を検出して失敗した。公式npmメタデータでnode-forge 1.4.0、adbkit 3.3.9、web-ext 10.8.0の依存経路を確認した。上流最新版も影響を受け、安全な公式修正版がないため、監査の抑制・無関係な降格・独自暗号パッチは加えていない。修正版公開後の再監査が必要。詳細はfindings.mdの再確認節を参照する。
- npm run checkは書式、生成ビルド、Nodeテスト4件、5拡張のweb-ext lint（警告0件）と未署名XPI生成まで通過し、最後の監査でhigh 3パッケージを検出して失敗した。署名申請・インストールは実施していない。
- 文書移動と参照整理では製品の実行時ロジックを変更していない。実機書換え、認証操作、外部サービスへの投稿・署名・リリースは実施せず、これらの動作が再検証済みであるとは扱わない。

## 2026-10-16: node-forgeの既存パッチによる限定修復

- 初回のraw監査に残ったGHSA-86w9-cpqp-85rvへ、Ununiqueの既存パッチと構造回帰を再利用した。node-forge 1.4.0に不足していたDigestAlgorithmのASN.1要素数検査を追加し、パッチと実ファイル全体のSHA-256・版を監査時に照合する。
- Node回帰5件は、パッチ真正性と冪等性、正常パラメーターあり／省略の署名受理、余分なネスト要素の拒否、当該GHSAのみの判別、未知のGHSA・別依存・親の別警告を失敗させる負例が通過した。raw監査の警告本文は保持し、パッチを確認した対応済みの1件として明示する。既知脆弱性0件という表示には置き換えない。
- npmの構成を維持し、npm ciでpostinstallがパッチを適用することを確認した。package-lockの変更はrootのhasInstallScript登録だけ。npm run checkは書式・生成build・既存Nodeテスト4件・5拡張lint（警告0）・未署名XPI生成・限定修復を検証する監査まで通過した。Mozilla署名やインストールは実施していない。

## 2026-10-20: Dependabot 月末一括処理

- `.github/dependabot.yml` は毎月28日00:00、`.github/workflows/dependabot-automation.yml` は同日18:00（いずれも `Asia/Tokyo`）に設定した。呼び出し先は検証済み共通 workflow の固定 SHA とし、現在の head SHA、Dependabot の資格状態、全 PR チェック成功を merge 前に再確認する。
- YAML 構文、変更差分、空白エラーをローカルで検査した。実際の月末 schedule と Dependabot PR の merge 経路は、次回の毎月28日実行で確認する。
