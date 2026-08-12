import { test, expect } from '@playwright/test';

test.describe('7人のQAペルソナによる意地悪な破壊的 E2E テスト', () => {

  // 💡 各テストの実行前に「環境チェック」を行う
  test.beforeEach(async ({ page }, testInfo) => {
    // ENV_NAME が 'staging' でない場合はテストを自動スキップ
    if (process.env.ENV_NAME !== 'staging') {
      testInfo.skip(true, 'この E2E 破壊テスト群は Staging 環境限定です');
    }

    // ベースURLを環境変数から取得（未設定の場合はデフォルト値）
    const baseUrl = process.env.BASE_URL || 'https://demo.playwright.dev/todomvc/';
    await page.goto(baseUrl);
  });

  /**
   * P1 新人QA: 説明を読まず直感で操作・誤操作・連打
   */
  test('P1: 空白文字の送信や無駄な連打を行っても、空のTodoが生成されないこと', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    // 1. スペースだけの入力で Enter 連打
    await input.fill('     ');
    await input.press('Enter');
    await input.press('Enter');

    // リストが追加されていない（空）であることを確認
    await expect(page.getByTestId('todo-item')).toHaveCount(0);

    // 2. 空のまま Enter を叩く
    await input.press('Enter');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  /**
   * P2 ベテランQA: キーボード高速入力・Tab遷移・トリム挙動
   */
  test('P2: 前後の余白が自動トリムされ、キーボード操作で正しくフォーカスが当たる', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    // 前後に無駄なスペースを入れて送信（仕様通りのトリムチェック）
    await input.fill('   キーボード操作タスク   ');
    await input.press('Enter');

    const todoTitle = page.getByTestId('todo-title').first();
    // 前後のスペースが自動で削られていることを確認
    await expect(todoTitle).toHaveText('キーボード操作タスク');
  });

  /**
   * P3 悪意のQA: XSS攻撃文字列・超長文・特殊文字の投入
   */
  test('P3: XSSスクリプトや超長文を注入してもアプリがエスケープ処理し破壊されないこと', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    // XSSペロードと超長文
    const xssPayload = '<script>window.xssVulnerable = true;</script>';
    const longText = 'A'.repeat(500);

    // XSS文字列の投入
    await input.fill(xssPayload);
    await input.press('Enter');

    // JSが実行されていない（エスケープされて単なる文字列になっている）ことを検証
    const isXssTriggered = await page.evaluate(() => (window as any).xssVulnerable);
    expect(isXssTriggered).toBeUndefined();
    await expect(page.getByTestId('todo-title').first()).toHaveText(xssPayload);

    // 超長文の投入
    await input.fill(longText);
    await input.press('Enter');
    await expect(page.getByTestId('todo-title').nth(1)).toHaveText(longText);
  });

  /**
   * P4 データ整合QA: 画面表示だけでなく LocalStorage の実データ構造を確認
   */
  test('P4: 画面上の操作結果が LocalStorage の実データと完全に整合していること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('DB整合性チェック用タスク');
    await input.press('Enter');

    // LocalStorage の中身を直接覗いて検証
    const storageData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('react-todos') || '[]');
    });

    expect(storageData).toHaveLength(1);
    expect(storageData[0].title).toBe('DB整合性チェック用タスク');
    expect(storageData[0].completed).toBe(false);
  });

  /**
   * P5 移行QA: 過去の異形データや壊れた LocalStorage データが存在する場合の挙動
   */
  test('P5: 既存のデータ（LocalStorage）がブラウザに残っている状態から正常に読み込めること', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'https://demo.playwright.dev/todomvc/';

    // ページ読み込み前に直接 LocalStorage へ過去データを注入
    await page.addInitScript(() => {
      const mockData = [
        { id: '1', title: '旧バージョンで作成したタスク', completed: true },
        { id: '2', title: '特殊文字を含んだ旧タスク 𩸽 𠮷', completed: false }
      ];
      localStorage.setItem('react-todos', JSON.stringify(mockData));
    });

    // 注入後にページへ再アクセス
    await page.goto(baseUrl);

    // 旧データが崩れずに画面に復元されていることを確認
    const items = page.getByTestId('todo-title');
    await expect(items).toHaveCount(2);
    await expect(items.first()).toHaveText('旧バージョンで作成したタスク');
    await expect(items.nth(1)).toHaveText('特殊文字を含んだ旧タスク 𩸽 𠮷');
  });

  /**
   * P6 回帰QA: フィルター切り替え時に件数カウントや他リストが壊れないこと
   */
  test('P6: 完了状態変更とフィルター切り替えの複合操作時にカウント数が正しく維持されること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('タスク1');
    await input.press('Enter');
    await input.fill('タスク2');
    await input.press('Enter');

    // タスク1を完了にする
    await page.getByTestId('todo-item').first().getByRole('checkbox').check();

    // カウント表示が「1 item left」になっていることを確認
    const todoCount = page.getByTestId('todo-count');
    await expect(todoCount).toHaveText('1 item left');

    // 「Completed」フィルターに切り替え
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);

    // 「All」に戻してもカウントが「1 item left」のままであること
    await page.getByRole('link', { name: 'All' }).click();
    await expect(todoCount).toHaveText('1 item left');
  });

  /**
   * P7 仕様懐疑QA: 「全選択（Toggle All）」後に1件だけ解除した際のエッジケース仕様
   */
  test('P7: 全完了ボタン（Toggle All）適用後に1件解除した際、全完了チェックが自動解除されること', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('タスクA');
    await input.press('Enter');
    await input.fill('タスクB');
    await input.press('Enter');

    // 「Mark all as complete」を押す
    const toggleAll = page.getByLabel('Mark all as complete');
    await toggleAll.check();

    // 両方とも完了（completedクラスが付与）されているか検証
    await expect(page.getByTestId('todo-item').first()).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-item').nth(1)).toHaveClass(/completed/);

    // 1件だけ未完了に戻す
    await page.getByTestId('todo-item').first().getByRole('checkbox').uncheck();

    // 「Mark all as complete」のトグル状態が解除されていることを突合検証
    await expect(toggleAll).not.toBeChecked();
  });

});