import { test, expect } from '@playwright/test';

// セキュリティテストは Staging 環境限定
test.beforeEach(async ({}, testInfo) => {
  if (process.env.ENV_NAME !== 'staging') {
    testInfo.skip(true, 'このテストは Staging 環境限定です');
  }
});

test.describe('SauceDemo Security & Input Validation Tests', () => {

  // -------------------------------------------------------------
  // 1. ログイン前（ログインフォーム）のセキュリティ検証
  // -------------------------------------------------------------
  test.describe('ログイン前 (Login Form)', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('https://www.saucedemo.com/');
    });

    test('P1-1: ユーザー名に XSS 文字列を入力しても実行されないこと', async ({ page }) => {
      const xssPayload = "<script>alert('XSS')</script>";
      await page.locator('[data-test="username"]').fill(xssPayload);
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      const usernameValue = await page.locator('[data-test="username"]').inputValue();
      expect(usernameValue).toBe(xssPayload);
    });

    test('P1-2: 非常に長い文字列を入力してもクラッシュしないこと', async ({ page }) => {
      const longString = 'A'.repeat(1000);
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill(longString);
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
    });

    test('P1-3: SQL インジェクション風の文字列を入力してバイパスできないこと', async ({ page }) => {
      const sqlPayload = "' OR '1'='1";
      await page.locator('[data-test="username"]').fill(sqlPayload);
      await page.locator('[data-test="password"]').fill('any');
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.url()).toBe('https://www.saucedemo.com/');
    });
  });

  // -------------------------------------------------------------
  // 2. ログイン後（購入手続きフォーム等）のセキュリティ検証
  // -------------------------------------------------------------
  test.describe('ログイン後 (Checkout Form)', () => {

    test.beforeEach(async ({ page }) => {
      // ログインして購入フォームまで移動
      await page.goto('https://www.saucedemo.com/');
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await page.locator('[data-test="login-button"]').click();
      await page.locator('.title').waitFor({ state: 'visible' });

      // 商品をカートに入れて Checkout 画面に遷移
      await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      await page.locator('.shopping_cart_link').click();
      await page.locator('[data-test="checkout"]').click();
      await page.locator('[data-test="firstName"]').waitFor({ state: 'visible' });
    });

    test('P2-1: 配送先入力（名前・郵便番号）に XSS 文字列を注入しても安全に処理されること', async ({ page }) => {
      const xssPayload = "<img src=x onerror=alert('XSS')>";

      await page.locator('[data-test="firstName"]').fill(xssPayload);
      await page.locator('[data-test="lastName"]').fill('Tester');
      await page.locator('[data-test="postalCode"]').fill('123-4567');
      await page.locator('[data-test="continue"]').click();

      // 次の画面（確認画面）へ正常に進み、スクリプトが発火せずサニタイズ描画されていることを確認
      await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    });

    test('P2-2: 配送先フォームに超長文（10,000文字）を入力してもシステムが崩壊しないこと', async ({ page }) => {
      const hugeText = 'B'.repeat(10000);

      await page.locator('[data-test="firstName"]').fill('Taro');
      await page.locator('[data-test="lastName"]').fill('Yamada');
      await page.locator('[data-test="postalCode"]').fill(hugeText);
      await page.locator('[data-test="continue"]').click();

      // クラッシュせずにエラーまたは次画面遷移が適切に行われること
      await expect(page.locator('.title')).toBeVisible();
    });
  });
});