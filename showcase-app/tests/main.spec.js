import { test, expect } from './fixtures';

test('page has correct title', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Solid Auth Showcase/);
});

test('Default state with no active profile', async ({page, mainPage}) => {
  await mainPage.loadPage();

  await expect(page.getByRole('button', { name: /Log in/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue as/ })).not.toBeVisible();
});

test('Default state with an active profile', async ({page, mainPage, popupPage}) => {
  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile', 'Test IPD');

  await mainPage.loadPage();

  await expect(page.getByRole('button', { name: /Continue as Test Profile/ })).toBeVisible();
});

test('Switching extension profiles activates the correct profile in the app', async ({page, mainPage, popupPage}) => {
  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', 'Test IPD A');

  await mainPage.loadPage();
  await expect(page.getByRole('button', { name: /Continue as Test Profile A/ })).toBeVisible();

  await popupPage.createProfile('Test Profile B', 'Test IPD B');

  await mainPage.loadPage();
  await expect(page.getByRole('button', { name: /Continue as Test Profile B/ })).toBeVisible();
});
