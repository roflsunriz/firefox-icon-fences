# Firefox Icon Fences

Firefoxのツールバーに5本の移動可能な縦線を追加し、拡張機能のアイコンを用途別に区切ります。各フェンスは独立した最小構成のWebExtensionです。閲覧中のページや履歴などへアクセスする権限は要求しません。

## インストール

1. [Releases](https://github.com/roflsunriz/firefox-icon-fences/releases) から、同じバージョンの次の5ファイルをダウンロードします。
   - `icon-fence-1-<バージョン>.xpi`
   - `icon-fence-2-<バージョン>.xpi`
   - `icon-fence-3-<バージョン>.xpi`
   - `icon-fence-4-<バージョン>.xpi`
   - `icon-fence-5-<バージョン>.xpi`
2. Firefoxで `about:addons` を開きます。
3. 歯車メニューから「ファイルからアドオンをインストール」を選び、5個のXPIを1つずつ追加します。
4. ツールバーを右クリックして「ツールバーをカスタマイズ」を開きます。
5. 「アイコンフェンス 1」から「アイコンフェンス 5」を、アイコンを分けたい位置へドラッグします。

各フェンスは区切り線としてだけ動作するため、クリックしても何も起きません。初回配置がツールバー外になった場合は、拡張機能ボタンのメニューからピン留めするか、「ツールバーをカスタマイズ」で移動してください。

## 更新と削除

新しいリリースの同じ番号のXPIをインストールすると更新できます。自動更新は行わないため、必要なときにReleasesを確認してください。削除する場合は `about:addons` の「拡張機能」から各フェンスを削除します。

## プライバシー

- Webページ、タブ、履歴、ブックマーク、通信内容にはアクセスしません。
- 外部へデータを送信しません。
- 権限、バックグラウンドスクリプト、コンテンツスクリプトを持ちません。

## 開発

Node.js 22以降が必要です。

```powershell
npm ci
npm run check
```

`npm run build` は5個の拡張機能ソースを `dist/extensions` に生成し、`npm run package` は未署名の検証用XPIを `dist/unsigned` に生成します。Firefox Stableへ恒久的にインストールできる配布物は、GitHub ActionsがMozilla Add-ons APIで署名したRelease上のXPIだけです。

詳しい更新・リリース方法は [how-to-update.md](how-to-update.md)、検証方法は [verification.md](verification.md) を参照してください。

## ライセンス

[MIT License](LICENSE)
