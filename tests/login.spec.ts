import { test, expect } from '@playwright/test';

test.describe('ログイン機能とダッシュボードのテスト', () => {

  test('正しい資格情報でログインでき、スクリーンショットが保存されること', async ({ page }) => {
    // 1. ページへ移動
    await page.goto('https://example.com/login');

    // 2. フォームへのテキスト入力
    // placeholder や label、CSSセレクターなどで要素を指定します
    await page.getByPlaceholder('ユーザー名を入力').fill('test_user');
    await page.getByLabel('パスワード').fill('Password123!');

    // 3. ボタンのクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 4. アサーション（検証）
    // ログイン後に特定のURLへ遷移したか確認
    await expect(page).toHaveURL('https://example.com/dashboard');

    // 特定のメッセージが表示されているか確認（自動で待機してくれます）
    const welcomeMessage = page.getByRole('heading', { level: 1 });
    await expect(welcomeMessage).toHaveText('ようこそ、test_userさん');

    // 5. スクリーンショットの撮影と保存
    // 画面全体（フルページ）のスクショを取得
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-full.png', 
      fullPage: true 
    });

    // 特定の要素だけを切り抜いてスクショを取得
    await welcomeMessage.screenshot({ 
      path: 'tests/screenshots/welcome-message.png' 
    });
  });

});