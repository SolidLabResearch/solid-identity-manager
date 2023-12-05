import { test, expect } from './fixtures';

test('page has correct title', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Solid Auth Showcase/);
});

test('Default state with no active profile', async ({page, mainPage}) => {
  await mainPage.start();

  await expect(page.getByRole('button', { name: /Log in/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue as/ })).not.toBeVisible();
});

test('Default state with an active profile', async ({page, mainPage, popupPage}) => {
  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile', 'Test IPD');

  await mainPage.start();

  await expect(page.getByRole('button', { name: /Continue as Test Profile/ })).toBeVisible();
  await page.waitForTimeout(2000)

});
