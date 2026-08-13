import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

test.describe('SauceDemo 基本機能テスト', () => {
  // 各テスト実行前に Staging 環境かどうか判定
  test.beforeEach(({}, testInfo) => {
    if (process.env.ENV_NAME !== 'staging') {
      testInfo.skip(true, 'このテストは Staging 環境限定です');
    }
  });

  test('正常にログインでき、商品一覧が表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // 1. ログイン画面へ遷移＆ログイン実行
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // 2. URLと商品一覧タイトルの検証
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(inventoryPage.title).toHaveText('Products');

    // 3. 商品カードが複数件（6件）表示されていることを検証
    await expect(inventoryPage.productItems).toHaveCount(6);
  });

  test('商品をカートに追加でき、カートバッジが更新されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // ログイン処理
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // バックパックをカートに追加
    await inventoryPage.addItemToCart('add-to-cart-sauce-labs-backpack');

    // カートアイコンのバッジ数値が「1」になっているか検証
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('商品のソート順（価格の安い順）を変更できること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // ログイン処理
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // 価格の安い順（Price (low to high)）に並び替え
    await inventoryPage.selectSortOption('lohi');

    // 最初の商品の価格取得用ロケータ
    const firstItemPrice = page.locator('.inventory_item_price').first();

    // 最安値商品（$7.99）が一番上に来ていることを検証
    await expect(firstItemPrice).toHaveText('$7.99');
  });
});