# 調査知見

- Firefox Stableへ恒久インストールできるのはMozilla署名済みXPIだけ。ローカルの未署名XPI生成を配布成功と扱わない。
- `web-ext` は `adbkit` 経由で脆弱な `node-forge@1.4.0` を含むが、lint・XPI生成・署名に必要なので削除や旧版降格で監査を隠さない。ローカルパッチは版・パッチ・適用前後本文を照合し、署名構造の回帰後だけ当該GHSAを限定許容する。`--ignore-scripts` 導入は未適用になる。
- `web-ext` が固定する `fx-runner@1.6.0` は `overrides.web-ext.fx-runner` で公式1.7.0へ上げる。web-ext更新時はoverride不要になったか再確認する。
- 上流修正版へ移行するときはローカルパッチと限定監査例外を同時に削除し、未知のAdvisoryや別依存まで許容しない。
