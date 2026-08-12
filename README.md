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

```bash
npm ci
npx playwright install --with-deps
```
### 2. テストの実行
Bash
# すべての E2E テストを実行
npx playwright test

# UI モードでテストを実行（デバッグ用）
npx playwright test --ui

# テスト結果の HTML レポートを表示
npx playwright show-report
