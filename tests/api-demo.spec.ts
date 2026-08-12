import { test, expect } from '@playwright/test';

test.describe('API テストの各種パターン', () => {

  // 1. GET リクエスト（データ取得）のテスト
  test('GET: 記事一覧と特定の記事が正常に取得できること', async ({ request }) => {
    // 画面(page)ではなく request を使って API を叩きます
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

    // ステータスコードが 200 OK であることを確認
    expect(response.status()).toBe(200);

    // レスポンスの JSON データを取り出す
    const body = await response.json();

    // 取得したデータの中身を検証
    expect(body.id).toBe(1);
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('userId');
  });


  // 2. POST リクエスト（データ作成）のテスト
  test('POST: 新しい記事を正常に投稿できること', async ({ request }) => {
    const newPost = {
      title: 'PlaywrightでつくるAPIテスト',
      body: 'HTTPリクエストも簡単にテストできます',
      userId: 1,
    };

    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost, // リクエストボディに送信するオブジェクトを渡す
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    // 201 Created （作成成功）であることを検証
    expect(response.status()).toBe(201);

    const body = await response.json();
    
    // 送信したデータがレスポンスに含まれているか検証
    expect(body.title).toBe(newPost.title);
    expect(body.body).toBe(newPost.body);
    expect(body.id).toBeDefined(); // 新しいIDが割り当てられているか
  });


  // 3. PUT / DELETE リクエスト（更新・削除）のテスト
  test('DELETE: 記事を削除できること', async ({ request }) => {
    const response = await request.delete('https://jsonplaceholder.typicode.com/posts/1');

    // 200 OK であることを検証
    expect(response.status()).toBe(200);
  });

});