import { test, expect } from '@playwright/test';

// テストグループ1: タイトルと要素の確認
test('Playwright公式サイトのタイトルとボタンの検証', async ({ page }) => {
  // 1. ページへ移動
  await page.goto('https://playwright.dev/');

  // 2. ページのタイトルに「Playwright」が含まれているか検証
  await expect(page).toHaveTitle(/Playwright/);

  // 3. 「Get started」リンクを取得
  const getStartedLink = page.getByRole('link', { name: 'Get started' });

  // 4. リンクが表示されているか検証
  await expect(getStartedLink).toBeVisible();

  // 5. リンクをクリック
  await getStartedLink.click();

  // 6. 遷移後のURLに「docs/intro」が含まれているか検証
  await expect(page).toHaveURL(/.*docs\/intro/);
});

// テストグループ2: フォーム入力や検索の簡易テスト
test('検索機能の入力と表示確認', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // 検索ボタン（またはショートカット検索枠）をクリック
  await page.getByRole('button', { name: 'Search' }).click();

  // 検索入力欄にテキストを入力
  await page.getByPlaceholder('Search docs').fill('locator');

  // 検索結果の最初に出てくる項目を確認
  await expect(page.getByRole('link', { name: 'Locators', exact: true }).first()).toBeVisible();
});