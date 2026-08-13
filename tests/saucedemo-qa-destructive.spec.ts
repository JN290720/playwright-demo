import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

test.describe('SauceDemo 破壊的・限界値テスト（QA観点）', () => {
  test.beforeEach(({}, testInfo) => {
    if (process.env.ENV_NAME !== 'staging') {
      testInfo.skip(true, 'このテストは Staging 環境限定です');
    }
  });

  test('空のユーザー名・パスワードでログインを試みた場合、適切なエラーが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    
    // 何も入力せずにログインボタンをクリック
    await loginPage.loginButton.click();

    // ユーザー名必須のエラーが表示されるか確認
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('極端に長い文字列や特殊文字を入力してもクラッシュしないこと', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // 1,000文字の超長文文字列を入力してログイン試行
    const longInput = 'A'.repeat(1000);
    await loginPage.login(longInput, longInput);

    // アプリがクラッシュせず、通常の認証エラーが表示されること
    await expect(loginPage.errorMessage).toBeVisible();
  });
});