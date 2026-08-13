import { Page, Locator } from '@playwright/test';

/**
 * TodoMVC デモアプリ（https://demo.playwright.dev/todomvc）を操作・検証するための Page Object クラス
 */
export class TodoPage {
  // Playwright の Page インスタンス
  readonly page: Page;

  // 画面要素のプロパティ宣言
  readonly newTodoInput: Locator; // 新規 Todo アイテム入力用テキストボックス
  readonly todoItems: Locator;    // 追加された Todo アイテムのリスト行（li要素）
  readonly todoTitles: Locator;   // Todo のテキスト本文要素

  /**
   * コンストラクタ：プレースホルダーや data-testid を用いて要素を特定
   * @param page Playwright から渡される Page オブジェクト
   */
  constructor(page: Page) {
    this.page = page;

    // Playwright 推奨のアクセシビリティ・テストIDロケータで要素を指定
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.todoTitles = page.getByTestId('todo-title');
  }

  /**
   * TodoMVC デモページへ遷移する
   */
  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  /**
   * 新しい Todo タスクを1件追加する（テキスト入力 ＋ Enterキー押下）
   * @param text 追加したいタスクの内容
   */
  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /**
   * 指定した位置（インデックス）の Todo のチェックボックスをクリックして完了にする
   * @param index 0始まりの要素番号（例: 0 = 1番目のタスク）
   */
  async toggleTodo(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').check();
  }
}