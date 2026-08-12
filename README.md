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
# すべての E2E テストを実行
```
npx playwright test
```
# UI モードでテストを実行（デバッグ用）
```
npx playwright test --ui
```
# テスト結果の HTML レポートを表示
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
