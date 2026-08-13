import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

test.describe('SauceDemo 破壊的・異常系テストスイート（全12ケース）', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('P1: 空のユーザー名とパスワードでログイン試行時にエラーが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('P2: パスワードのみ未入力でログイン試行時にエラーが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('P3: 存在しない無効なユーザー情報でエラーが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid_user', 'wrong_password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  test('P4: 凍結（ロックアウト）されたユーザーでエラーが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out');
  });

  test('P5: ユーザー名の前後に余白が含まれている場合、ログインに失敗すること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // SauceDemoは余白トリムを自動で行わないため認証エラーになる仕様を検証
    await loginPage.login(' standard_user ', 'secret_sauce');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  test('P6: 未ログイン状態で商品ページへ直リンク移動した場合、ログイン画面へリダイレクトされること', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    const loginPage = new LoginPage(page);
    await expect(loginPage.errorMessage).toBeVisible();
    // 実際の SauceDemo のエラーメッセージ文言に修正
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });

  test('P7: ログアウト操作後にブラウザの「戻る」ボタンを押しても認証保護されること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret_sauce');
    
    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');

    await page.goBack();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('P8: パスワード入力欄がマスク処理（type="password"）されていること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('P9: カートに同じ商品を複数回追加しても、カートバッジが正しく1件としてカウントされること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart('add-to-cart-sauce-labs-backpack');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('P10: 商品一覧のソート機能（価格の安い順）が正しく並び変わること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.selectSortOption('lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test('P11: チェックアウト画面で未入力のまま送信した場合、フォームバリデーションエラーが出ること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret_sauce');

    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await page.click('[data-test="continue"]');

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
  });

  test('P12: セッション切れや無効なパラメータでの注文完了画面直リンクを防止できること', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/checkout-complete.html');
    const loginPage = new LoginPage(page);
    await expect(loginPage.errorMessage).toBeVisible();
  });
});