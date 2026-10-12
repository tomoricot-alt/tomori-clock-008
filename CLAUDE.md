# TOMORI APP LAB アプリ共通ルール (Claude Code 用)

このリポジトリは「TOMORI APP LAB」(50個の小規模アプリを無料公開するプロジェクト) の1アプリです。
一覧サイト: https://tomoricot-alt.github.io/tomori-app-lab/ (リポジトリ: tomoricot-alt/tomori-app-lab)

## 必ず守ること
1. リポジトリ名は `tomori-<アプリ名>-<3桁の番号>` (例: `tomori-cards-004`)。番号は `app-info.json` の `id` と同じにする。
2. `app-info.json` を必ず作る・最新に保つ。これが一覧サイトの紹介文・使い方ページになる。
   - 文章は実際のアプリの動作・README・`docs/USER_GUIDE.md` と一致させる (推測で書かない)。
   - `appUrl` は `https://tomoricot-alt.github.io/<リポジトリ名>/` にする。
   - `usageSteps` は 3〜5 ステップ。
   - 公開日・公開ステータスは書かない (GitHub の公開履歴から自動判定される)。
   - 検証: `npm run validate:app-info` がエラー 0 であること。
3. `README.md` / `docs/USER_GUIDE.md` / `docs/DEV_REPORT.md` を用意する (雛形は同梱)。
4. 無料で運用する: サーバー・有料API・生成AI API・個人情報の収集・広告・外部送信を使わない。データは端末のブラウザ内 (localStorage) に保存し、その旨をアプリ内と USER_GUIDE に明記する。
5. 不要なライブラリを追加しない。機密情報を書かない。
6. 公開は GitHub Pages (`.github/workflows/deploy.yml`)。`main` は直接編集せず、作業ブランチ → Pull Request → 本人が承認してマージ。
7. 他のアプリや一覧サイトのコードを変更しない。一覧サイトへの登録作業は不要 (自動で検出される)。

## 完了時にやること
- `npm run typecheck` / `npm test` / `npm run build:web` / `npm run validate:app-info` の結果を DEV_REPORT.md に記録する。
- 実機で確認できていないことは「確認済み」と書かず、未確認として明記する。
- 初回のみ: リポジトリの Settings → Pages → Source を「GitHub Actions」にするよう、本人に案内する。
