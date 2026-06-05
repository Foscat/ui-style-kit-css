import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: {
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1
  }
});
