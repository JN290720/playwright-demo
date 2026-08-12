import { test, expect } from '@playwright/test';

test.describe('SauceDemo 基本機能テスト（正常系）', () => {

  test.beforeEach(async ({ page }) => {
    // 1. ログイン画面へアクセスしてログイン
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // ログイン成功（商品一覧ページへ遷移）の確認
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('1. 商品一覧から商品をカートに追加し、バッジの件数が更新されること', async ({ page }) => {
    // 最初の商品の「Add to cart」を押す
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // カートアイコンに「1」と表示されることを確認
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });

  test('2. 商品の並び替え（価格の安い順）が正しく機能すること', async ({ page }) => {
    const sortSelect = page.locator('[data-test="product-sort-container"]');
    
    // 価格の安い順 (lohi) にソート
    await sortSelect.selectOption('lohi');

    // 最初の商品の価格が $7.99 であることを確認
    const firstPrice = page.locator('.inventory_item_price').first();
    await expect(firstPrice).toHaveText('$7.99');
  });

  test('3. 商品追加から購入完了までの注文フロー（チェックアウト）を完了できること', async ({ page }) => {
    // 1. カートに商品を追加してカート画面へ遷移
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/.*cart.html/);

    // 2. Checkout 画面へ進む
    await page.locator('[data-test="checkout"]').click();

    // 3. 配送先情報を入力
    await page.locator('[data-test="firstName"]').fill('Taro');
    await page.locator('[data-test="lastName"]').fill('Yamada');
    await page.locator('[data-test="postalCode"]').fill('100-0001');
    await page.locator('[data-test="continue"]').click();

    // 4. 注文確認画面から送信完了（Finish）
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await page.locator('[data-test="finish"]').click();

    // 5. 完了メッセージの検証
    const completeHeader = page.locator('.complete-header');
    await expect(completeHeader).toHaveText('Thank you for your order!');
  });

});