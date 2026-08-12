import { test, expect } from '@playwright/test';

test.describe('7人のQAペルソナによる SauceDemo 破壊テスト', () => {

  // 💡 各テストの実行前に「環境チェック」を行う
  test.beforeEach(({}, testInfo) => {
    // ENV_NAME が 'staging' でない場合はテストを自動スキップ
    if (process.env.ENV_NAME !== 'staging') {
      testInfo.skip(true, 'この破壊テスト群は Staging 環境限定です');
    }
  });

  // ベースURLを環境変数から取得（未設定の場合はデフォルト値）
  const baseUrl = process.env.BASE_URL || 'https://www.saucedemo.com';

  /**
   * P1 新人QA: 空送信・ロックアカウントでの誤ログイン
   */
  test('P1: ロックアウトされたユーザーや空の認証情報でエラーメッセージが表示されること', async ({ page }) => {
    await page.goto(baseUrl);

    // 1. 空のままログインボタンを押す
    await page.locator('[data-test="login-button"]').click();
    await expect(page.locator('[data-test="error"]')).toContainText('Epic sadface: Username is required');

    // 2. ロックアウトされているアカウントでログインを試みる
    await page.locator('[data-test="username"]').fill('locked_out_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });

  /**
   * P2 ベテランQA: チェックアウト時の必須項目未入力チェック
   */
  test('P2: 購入手続きで配送先情報が空のまま「Continue」を押すとエラーが表示されること', async ({ page }) => {
    await page.goto(baseUrl);
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // カートに入れてチェックアウトまで進む
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // 配送先入力を何もせず Continue
    await page.locator('[data-test="continue"]').click();

    // エラーバナーが表示され、次へ進めないことの検証
    await expect(page.locator('[data-test="error"]')).toContainText('Error: First Name is required');
  });

  /**
   * P3 悪意のQA: ログインなしで直URLアクセス（認証バイパス防止）
   */
  test('P3: 未ログイン状態で保護されたページ（/inventory.html）に直接アクセスした際、拒否されること', async ({ page }) => {
    // ログインせず直接商品一覧ページへアクセスを試みる
    await page.goto(`${baseUrl}/inventory.html`);

    // ログイン画面にリダイレクトされ、不正アクセスエラーが表示されることを検証
    await expect(page).toHaveURL(`${baseUrl}/`);
    await expect(page.locator('[data-test="error"]')).toContainText("You can only access '/inventory.html' when you are logged in.");
  });

  /**
   * P4 データ整合QA: カート追加後の「Remove」トグルと合計カウントの整合性
   */
  test('P4: 商品追加・削除時にカートバッジのカウント数値が整合していること', async ({ page }) => {
    await page.goto(baseUrl);
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const cartBadge = page.locator('.shopping_cart_badge');

    // 2件追加
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(cartBadge).toHaveText('2');

    // 1件削除（Remove）
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(cartBadge).toHaveText('1');

    // カート画面内でも1件だけ残っているか照合
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  /**
   * P5 移行/互換性QA: Cookie/SessionStorage 消去時のログアウト強制挙動
   */
  test('P5: セッション（Cookie/Storage）が破棄された状態で操作した際、ログイン画面に戻されること', async ({ page }) => {
    await page.goto(baseUrl);
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // セッションクッキーを強制削除
    await page.context().clearCookies();
    await page.reload();

    // クッキー削除後にアクセスするとログイン画面に戻されること
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  /**
   * P6 回帰QA: サイドメニューからのログアウト機能が破綻していないか
   */
  test('P6: ハンバーガーメニューからの「Logout」が正常に動作し、戻るボタンでも再侵入できないこと', async ({ page }) => {
    await page.goto(baseUrl);
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // ハンバーガーメニューを開いてログアウト
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();

    await expect(page).toHaveURL(`${baseUrl}/`);

    // ブラウザの「戻る」ボタンを押しても再侵入できないこと
    await page.goBack();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  /**
   * P7 仕様懐疑QA: バグを含むアカウント（problem_user）での表示不整合検知
   */
  test('P7: problem_user でログインした際、商品画像が崩れている異常を検知できること', async ({ page }) => {
    await page.goto(baseUrl);
    // 仕様で画像崩れが埋め込まれているテスト用アカウント
    await page.locator('[data-test="username"]').fill('problem_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // 最初の商品の画像 URL を取得
    const firstImgSrc = await page.locator('.inventory_item_img img').first().getAttribute('src');

    // 正常なら "/static/media/sauce-backpack-1200x1500.0a0b853.jpg" 等が入るはずが、
    // problem_user は壊れた画像パス（sl-404.jpg）を返す仕様
    expect(firstImgSrc).toContain('sl-404');
  });

});