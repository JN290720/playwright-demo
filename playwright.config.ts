import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * 💡 コマンドラインから ENV を取得（未指定の場合はデフォルトで 'prod'）
 * 例: ENV=staging npx playwright test -> .env.staging を読み込む
 */
const env = process.env.ENV || 'prod';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

console.log(`[Playwright Config] 環境ファイル (.env.${env}) を読み込みました (ENV_NAME: ${process.env.ENV_NAME || '未設定'})`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* 💡 環境ファイル内の BASE_URL を使用（未設定なら http://localhost:3000 にフォールバック） */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* 失敗時の自動証拠収集設定 */
    trace: 'on-first-retry', // 失敗してリトライした時に詳細な操作ログ（Trace Viewer）を保存
    screenshot: 'only-on-failure', // テスト失敗時のみ画面キャプチャを自動取得
    video: 'retain-on-failure',   // テスト失敗時のみ動画（MP4）を自動保存
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});