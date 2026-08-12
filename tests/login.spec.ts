import { test, expect } from '@playwright/test';

// =================================================================
// パターン 1: Todoアプリの基本操作（リストへの追加・完了チェック・削除）
// =================================================================
test.describe('パターン1: Todoアプリの操作', () => {
  test('新しいTodoを追加して、完了状態にできること', async ({ page }) => {
    // Playwright公式のTodoデモサイトへ移動
    await page.goto('https://demo.playwright.dev/todomvc');

    // 1. テキストボックスにアイテムを入力して Enter キーを押す
    const newTodo = page.getByPlaceholder('What needs to be done?');
    await newTodo.fill('Playwrightのテストを書く');
    await newTodo.press('Enter');

    await newTodo.fill('GitHub ActionsでCIを回す');
    await newTodo.press('Enter');

    // 2. リストに2件追加されたことを検証（アサーション）
    const todoItems = page.getByTestId('todo-title');
    await expect(todoItems).toHaveCount(2);
    await expect(todoItems.first()).toHaveText('Playwrightのテストを書く');

    // 3. 1つ目のTodoのチェックボックスをクリックして完了にする
    await page.getByTestId('todo-item').first().getByRole('checkbox').check();

    // 4. 完了状態（打消し線スタイルのクラスがついたか）を検証
    await expect(page.getByTestId('todo-item').first()).toHaveClass(/completed/);
  });
});


// =================================================================
// パターン 2: Eコマースサイトのログイン〜カート追加（ユーザーフロー）
// =================================================================
test.describe('パターン2: ログインとショッピングカート操作', () => {
  test('ログインして商品をカートに追加できること', async ({ page }) => {
    // Eコマースの自動テスト練習用サイト SauceDemo
    await page.goto('https://www.saucedemo.com/');

    // 1. ログイン実行
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // 2. 商品一覧ページへ遷移したか確認
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // 3. 最初の商品の「Add to cart」ボタンをクリック
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // 4. カートアイコンのバッジ数字が「1」になったか検証
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });
});


// =================================================================
// パターン 3: フォームバリデーション（エラーメッセージの表示確認）
// =================================================================
test.describe('パターン3: フォームのエラーハンドリング', () => {
  test('不正なログイン情報で明確なエラーメッセージが表示されること', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // ロックアウトされたユーザー情報でログインを試みる
    await page.locator('[data-test="username"]').fill('locked_out_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // エラーメッセージ要素が表示され、特定のテキストを含んでいるか検証
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Sorry, this user has been locked out.');
  });
});


// =================================================================
// パターン 4: モバイル画面（レスポンシブ）のレイアウト検証
// =================================================================
test.describe('パターン4: スマホ表示のテスト', () => {
  // このテストだけビューポート（画面サイズ）をiPhoneサイズに変更
  test.use({ viewport: { width: 390, height: 844 } });

  test('スマホ表示でハンバーガーメニューが表示されること', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // ログイン
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // モバイルサイズ時に左上のメニューボタン（ハンバーガーアイコン）が存在するか検証
    const menuButton = page.locator('#react-burger-menu-btn');
    await expect(menuButton).toBeVisible();
    
    // クリックしてサイドナビが開くか確認
    await menuButton.click();
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();
  });
});