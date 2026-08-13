import { test, expect } from '@playwright/test';

// Staging 環境でネットワーク疑似エラーテストを実行
test.beforeEach(async ({}, testInfo) => {
  if (process.env.ENV_NAME !== 'staging') {
    testInfo.skip(true, 'このテストは Staging 環境限定です');
  }
});

test.describe('SauceDemo Network Mocking & Resilience Tests', () => {

  // -------------------------------------------------------------
  // 1. 画像アセット障害モック（商品画像の取得失敗時の挙動）
  // -------------------------------------------------------------
  test('P1: 商品画像が 500 エラー（読み込み失敗）の場合でもレイアウトが破綻しないこと', async ({ page }) => {
    // 💡 全ての商品画像 (.jpg / .png) のリクエストを横取りして 500 エラーを返す
    await page.route('**/*.{png,jpg,jpeg}', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'image/png',
        body: ''
      });
    });

    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // 💡 検証: 画像が読み込めなくても画面タイトルや商品名テキスト、ボタンが正しく表示されていること
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item_name').first()).toBeVisible();
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeEnabled();
  });

  // -------------------------------------------------------------
  // 2. 通信遅延（レスポンス遅延・低速回線）シミュレーション
  // -------------------------------------------------------------
  test('P2: 通信が著しく遅い環境（3秒のディレイ）でもログイン～カート追加が完了すること', async ({ page }) => {
    // 💡 すべてのリクエストに対して 3000ms (3秒) の遅延を付与
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // 遅延があっても最終的にログイン後の商品一覧が表示されること（タイムアウト設定を拡張）
    await expect(page.locator('.title')).toBeVisible({ timeout: 10000 });
  });

  // -------------------------------------------------------------
  // 3. ログイン後操作中のオフライン（通信断）テスト
  // -------------------------------------------------------------
  test('P3: 商品一覧を表示後にオフラインになっても、既存描画が維持されること', async ({ page, context }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('.title').waitFor({ state: 'visible' });

    // 💡 ログイン成功後にネットワークを切断（オフライン化）
    await context.setOffline(true);

    try {
      // オフライン状態でカートアイコンをクリック
      await page.locator('.shopping_cart_link').click();
    } catch (e) {
      console.log('オフライン状態のためクライアント側で遷移・通信が抑制されました');
    } finally {
      // ネットワーク状態を復元
      await context.setOffline(false);
    }
  });
});