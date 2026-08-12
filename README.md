# Playwright Demo & E2E Testing Pipeline

このプロジェクトは、Playwright を使用した Web アプリケーションの自動 E2E テスト、および GitHub Actions を活用した CI/CD パイプラインの構築デモ用リポジトリです。

---

## 🛠 テスト環境・使用技術

- **Testing Framework:** [Playwright](https://playwright.dev/)
- **Runtime:** Node.js (LTS)
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages

---

## 🚀 ローカルでのセットアップと実行

### 1. 依存関係のインストール
```
npm ci
npx playwright install --with-deps
```
### 2. テストの実行
#### すべての E2E テストを実行
```
npx playwright test
```
#### UI モードでテストを実行（デバッグ用）
```
npx playwright test --ui
```
#### テスト結果の HTML レポートを表示
```
npx playwright show-report
```
---

## 🔄 CI/CD パイプライン (GitHub Actions)

本リポジトリでは、用途に応じて 2 つのワークフローを自動実行しています。

| ワークフロー名 | 発火タイミング | 役割 |
| :--- | :--- | :--- |
| **PR Test** (`pull-request.yml`) | Pull Request 作成・更新時 | 事前検証テストの実行と PR 画面への結果自動コメント |
| **Deploy & Post-Deploy Test** (`deploy-and-test.yml`) | `main` ブランチへの Push / Merge 時 | GitHub Pages へのデプロイと、**公開後の本番 URL に対する自動 E2E テスト実行** |

---

## 📝 開発フローとブランチ戦略

1. 機能追加・修正時は `main` ブランチから作業ブランチを作成（例: `fix/xxx`, `feature/xxx`）
2. ローカルでテスト（`npx playwright test`）を実行して問題ないことを確認
3. PR を作成（自動で `.github/PULL_REQUEST_TEMPLATE.md` が適応されます）
4. CI のチェック（`PR Test`）が通過したことを確認して `main` へマージ
5. マージ後、自動でデプロイおよび公開後テストが実行されます

---
## PRタイトル命名ルール

本リポジトリでは、PR（Pull Request）のコミット履歴やレビューの可読性を保つため、以下の命名ルールを採用しています。

### 基本フォーマット

`<type>(<scope>): <概要（何をしたか）>`

※ `<scope>`（対象機能やモジュール名）は任意です。必要に応じて付与してください。

---

### プレフィックス（`<type>`）一覧

| プレフィックス | 意味・用途 | タイトル例 |
| :--- | :--- | :--- |
| **`test`** | テストコードの追加・修正 | `test: SauceDemoのE2E自動テスト（基本機能・異常系）を追加` |
| **`feat`** | 新機能の追加 | `feat: ログイン画面にパスワード表示切り替えを追加` |
| **`fix`** | バグ・不具合の修正 | `fix: カート画面で削除時に合計金額が更新されない不具合を修正` |
| **`refactor`** | リファクタリング（挙動を変えないコード整理） | `refactor: Page Object Pattern を導入してテストコードを再構築` |
| **`docs`** | ドキュメント（READMEやコメント等）の更新 | `docs: Playwrightのローカル実行手順をREADMEに追加` |
| **`chore`** | 設定ファイル・ビルド・ライブラリ更新など | `chore: Playwrightを最新バージョンへアップデート` |
| **`ci`** | CI/CDワークフロー（GitHub Actions等）の修正 | `ci: Playwrightテスト失敗時のみArtifactsを保存するよう変更` |

---

### 記述ルール・マナー

- **要点を簡潔に:** 50文字程度を目安にし、詳細は PR 本文（Description）に記載してください。
- **語尾の統一:** 日本語で記述する場合は「〜を追加」「〜を修正」など、具体的に実施した内容で終わるようにします。
- **スコープの活用例:** 
  - `test(saucedemo): E2E自動テストコードを追加`
  - `test(todomvc): 破壊テストケースを追加`
