import { test as base, chromium } from '@playwright/test';
import path from 'path';

import {PopupPage} from './popup-page';
import {MainPage} from './main-page';

export const test = base.extend({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        '--headless=new', // disable this line to run the tests in a visible browser window
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },

  popupPage: async ({ page, context, extensionId }, use) => {
    const popupPage = new PopupPage(context, page, extensionId);
    await popupPage.openPopup();
    await use(popupPage);
  },

  mainPage: async ({ context }, use) => {
    const newTab = await context.newPage();
    const mainPage = new MainPage(context, newTab);
    await use(mainPage);
  }

});
export const expect = test.expect;


