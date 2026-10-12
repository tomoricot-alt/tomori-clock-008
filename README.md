# TOMORI CLOCK（APP 008）

TOMORI APP LAB 第8号。小学3・4年生が、アナログ時計を見ながら時刻の読み方を楽しく練習するアプリです。

- 公開URL: https://tomoricot-alt.github.io/tomori-clock-008/
- 技術: React Native / Expo / TypeScript / React Native Web（時計の描画は `react-native-svg`）
- サーバー・ログイン・広告・有料API・外部AI APIは使いません。学習結果は端末のブラウザ内（localStorage）だけに保存し、外部へ送信しません。名前・学校名・連絡先は取得しません。
- ⚠️ ブラウザのサイトデータを削除すると、学習結果が消える可能性があります。

## 機能

- 大きなアナログ時計（長針＝あお・ながい／短針＝オレンジ・みじかい・太い）
- 5分単位の「にゅうもん」／1分単位の「チャレンジ」
- 「みてみよう」: 針を動かしてデジタル表示・よみがなとくらべる
- 「じこくを つくろう」: 出された時刻になるように針を動かす練習
- 「クイズ 10もん」: 時計を読む4択（7問）と、時刻を作る問題（3問）。正解・不正解の判定と結果集計
- 針は指（マウス）で動かせるほか、「じ」「ふん」を増減する大きなボタンでも操作可能
- 「きろく」: モードごとの最高得点と最近10回の結果（端末内保存）

## 時計の計算

時刻は「12:00からの経過分 `total`（0〜719）」の整数で持ちます（`src/logic/clock.ts`）。

- 長針の角度 = 分 × 6°
- 短針の角度 = `total` × 0.5°（1時間＝30°、1分＝0.5°。分に合わせて少しずつ動く）
- 719分（11:59）の次は剰余で 0分（12:00）に戻るため、12時またぎも正確

## 開発

```bash
npm ci
npm run web                # 開発サーバー
npm run typecheck          # 型チェック
npm test                   # テスト (vitest)
npm run build:web          # 公開用ビルド (dist/)
npm run validate:app-info  # 一覧サイトに登録できる形式か確認
```

構成: `src/logic/`（計算・出題・判定・保存。テストあり）、`src/components/`、`src/screens/`、`src/App.tsx`。

## 公開（GitHub Pages）

1. 初回のみ: Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。
2. Pull Request を確認・承認して `main` にマージする。
3. `.github/workflows/deploy.yml` が検証・型チェック・テスト・ビルド・公開を自動で行う。
4. 公開後、TOMORI APP LAB の一覧サイトに自動で追加される（最大1時間程度）。

## ドキュメント

- [使い方](docs/USER_GUIDE.md)
- [開発レポート](docs/DEV_REPORT.md)
- 一覧サイト用の情報: [app-info.json](app-info.json)
