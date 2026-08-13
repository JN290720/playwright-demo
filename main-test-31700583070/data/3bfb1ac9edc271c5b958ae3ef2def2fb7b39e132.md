# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo-basic.spec.ts >> TodoApp 基本機能テスト（正常系） >> 3. Todo のタイトルをダブルクリックで編集・保存できること
- Location: tests/saucedemo-basic.spec.ts:29:7

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /home/runner/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
<launched> pid=4766
[pid=4766][err] /home/runner/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libevent-2.1.so.7: cannot open shared object file: No such file or directory
Call log:
  - <launching> /home/runner/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
  - <launched> pid=4766
  - [pid=4766][err] /home/runner/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libevent-2.1.so.7: cannot open shared object file: No such file or directory
  - [pid=4766] <gracefully close start>
  - [pid=4766] <kill>
  - [pid=4766] <will force kill>
  - [pid=4766] exception while trying to kill process: Error: kill ESRCH
  - [pid=4766] <process did exit: exitCode=127, signal=null>
  - [pid=4766] starting temporary directories cleanup
  - [pid=4766] finished temporary directories cleanup
  - [pid=4766] <gracefully close end>

```