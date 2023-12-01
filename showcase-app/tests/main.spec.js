import { test, expect } from '@playwright/test';

test('page has title', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Solid Auth Showcase/);
});
