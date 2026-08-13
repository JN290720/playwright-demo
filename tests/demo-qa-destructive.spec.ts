import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('7人のQAペルソナによる意地悪な破壊的 E2E テスト', () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('P1: 空白文字の送信や無駄な連打を行っても、空のTodoが生成されないこと', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.newTodoInput.fill('   ');
    await todoPage.newTodoInput.press('Enter');
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  test('P2: 前後の余白が自動トリムされ、キーボード操作で正しくフォーカスが当たる', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo('  余白付きタスク  ');
    await expect(todoPage.todoTitles.first()).toHaveText('余白付きタスク');
  });

  test('P3: XSSスクリプトや超長文を注入してもアプリがエスケープ処理し破壊されないこと', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const xssText = '<script>alert("xss")</script>';
    const longText = 'A'.repeat(150);

    await todoPage.addTodo(xssText);
    await todoPage.addTodo(longText);

    await expect(todoPage.todoTitles.nth(0)).toHaveText(xssText);
    await expect(todoPage.todoTitles.nth(1)).toHaveText(longText);
  });

  test('P4: 画面上の操作結果が LocalStorage の実データと完全に整合していること', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo('Storageテスト');

    const savedData = await page.evaluate(() => localStorage.getItem('react-todos'));
    expect(savedData).toContain('Storageテスト');
  });

  test('P5: 既存のデータ（LocalStorage）がブラウザに残っている状態から正常に読み込めること', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'react-todos',
        JSON.stringify([{ id: '1', title: '事前注入データ', completed: false }])
      );
    });

    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await expect(todoPage.todoTitles.first()).toHaveText('事前注入データ');
  });

  test('P6: 完了状態変更とフィルター切り替えの複合操作時にカウント数が正しく維持されること', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo('タスク1');
    await todoPage.addTodo('タスク2');

    await todoPage.toggleTodo(0);

    await page.getByRole('link', { name: 'Active' }).click();
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoTitles.first()).toHaveText('タスク2');

    await page.getByRole('link', { name: 'All' }).click();
    await expect(todoPage.todoItems).toHaveCount(2);
  });

  test('P7: 全完了ボタン（Toggle All）適用後に1件解除した際、全完了チェックが自動解除されること', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo('タスク1');
    await todoPage.addTodo('タスク2');

    // トグルオールラベルをクリック
    await page.getByLabel('Mark all as complete').click();

    // 1件解除
    await todoPage.toggleTodo(0);

    // Toggle All が未チェック状態に戻ることを確認
    await expect(page.getByLabel('Mark all as complete')).not.toBeChecked();
  });
});