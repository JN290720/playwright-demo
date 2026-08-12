import { test, expect } from '@playwright/test';

test.describe('TodoApp 基本機能テスト（正常系）', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test('1. 新しい Todo アイテムを登録できること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    // 1件登録
    await input.fill('牛乳を買う');
    await input.press('Enter');

    // リストに表示されたことを確認
    const todoList = page.getByTestId('todo-title');
    await expect(todoList).toHaveCount(1);
    await expect(todoList.first()).toHaveText('牛乳を買う');

    // 2件目を追加登録
    await input.fill('Playwrightの勉強をする');
    await input.press('Enter');

    // 件数と並び順を確認
    await expect(todoList).toHaveCount(2);
    await expect(todoList.nth(1)).toHaveText('Playwrightの勉強をする');
  });

  test('2. Todo の完了状態をチェックボックスで切り替えられること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('部屋の掃除');
    await input.press('Enter');

    const todoItem = page.getByTestId('todo-item').first();
    const checkbox = todoItem.getByRole('checkbox');

    // 初期状態は未完了
    await expect(todoItem).not.toHaveClass(/completed/);

    // チェックを入れて完了にする
    await checkbox.check();
    await expect(todoItem).toHaveClass(/completed/);

    // チェックを外して未完了に戻す
    await checkbox.uncheck();
    await expect(todoItem).not.toHaveClass(/completed/);
  });

  test('3. Todo のタイトルをダブルクリックで編集・保存できること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('既存のタスク');
    await input.press('Enter');

    const todoTitle = page.getByTestId('todo-title').first();

    // ダブルクリックして編集モードにする
    await todoTitle.dblclick();

    // 編集用入力欄のテキストを書き換えて Enter
    const editInput = page.getByRole('textbox', { name: 'Edit' });
    await editInput.fill('更新後のタスク名称');
    await editInput.press('Enter');

    // タイトルが更新されたことを確認
    await expect(todoTitle).toHaveText('更新後のタスク名称');
  });

  test('4. Todo をホバーして削除ボタン（×）で削除できること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('不要なタスク');
    await input.press('Enter');

    const todoItem = page.getByTestId('todo-item').first();

    // ホバーして削除ボタンを表示させてクリック
    await todoItem.hover();
    await todoItem.getByRole('button', { name: 'Delete' }).click();

    // リストから消えたこと（0件）を確認
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('5. フィルター（All / Active / Completed）で絞り込めること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('未完了タスク');
    await input.press('Enter');
    await input.fill('完了済タスク');
    await input.press('Enter');

    // 2件目のタスクを完了状態にする
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();

    // 1. Active（未完了のみ）フィルター
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title').first()).toHaveText('未完了タスク');

    // 2. Completed（完了済のみ）フィルター
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title').first()).toHaveText('完了済タスク');

    // 3. All（すべて表示）フィルター
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-title')).toHaveCount(2);
  });

  test('6. 「Clear completed」ボタンで完了済みタスクを一括削除できること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('残すタスク');
    await input.press('Enter');
    await input.fill('消すタスク');
    await input.press('Enter');

    // 2件目を完了にして「Clear completed」を押す
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();

    // 「残すタスク」だけが残っていることを確認
    await expect(page.getByTestId('todo-title')).toHaveCount(1);
    await expect(page.getByTestId('todo-title').first()).toHaveText('残すタスク');
  });

});