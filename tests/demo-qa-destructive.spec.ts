import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

// TodoMVC に対する破壊的入力（境界値・特殊文字）のテストスイート
test.describe('TodoMVC 破壊的・限界値テスト（QA観点）', () => {
  // 各テストケースが実行される前に自動的に実行される共通の前処理
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    // テストごとに毎回初期化された状態の Todo デモ画面へアクセス
    await todoPage.goto();
  });

  test('極端に長い文字列（150文字）を入力してもレイアウトが崩れず追加できること', async ({ page }) => {
    // ページオブジェクトのインスタンスを生成
    const todoPage = new TodoPage(page);
    
    // 境界値テスト用: 'A' を 150 文字分並べた超長文文字列を作成
    const longText = 'A'.repeat(150);

    // POM 経由で長文タスクを追加
    await todoPage.addTodo(longText);

    // 【検証】リストに 1 件追加されていること
    await expect(todoPage.todoTitles).toHaveCount(1);
    // 【検証】入力した長文テキストが崩れずにそのまま保持されていること
    await expect(todoPage.todoTitles.first()).toHaveText(longText);
  });

  test('特殊文字や絵文字を含むタスク名が正常に処理されること', async ({ page }) => {
    const todoPage = new TodoPage(page);
    
    // 記号・HTMLタグ（<script>等）・絵文字を含んだテスト文字列
    const specialText = '🔥 <script>alert("test")</script> & 🍣';

    // POM 経由で特殊文字タスクを追加
    await todoPage.addTodo(specialText);

    // 【検証】リストに 1 件追加されていること
    await expect(todoPage.todoTitles).toHaveCount(1);
    // 【検証】HTMLタグとして実行（スクリプト注入）されず、プレーンテキストとして安全に表示されていること
    await expect(todoPage.todoTitles.first()).toHaveText(specialText);
  });
});