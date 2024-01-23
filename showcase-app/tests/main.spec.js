import {expect, test} from './fixtures';
import { test as baseTest } from '@playwright/test';

test('Page has title and headlines', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Solid Auth Showcase/);
  await expect(page.getByRole('heading', {name: 'COOL SOLID APP'})).toBeVisible();
});

test('Default state with no active profile', async ({mainPage}) => {
  await mainPage.loadPage();

  await expect(mainPage.page.getByRole('button', {name: /Log in/})).toBeVisible();
  await expect(mainPage.page.getByRole('button', {name: /Continue as/})).toBeHidden();
});

test('Default state with an active profile', async ({mainPage, popupPage}) => {
  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile', 'Test IPD');

  await mainPage.loadPage();

  await expect(mainPage.getPage().getByRole('button', {name: /Continue as Test Profile/})).toBeVisible();
});

test('Switching extension profiles activates the correct profile in the app', async ({mainPage, popupPage}) => {
  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', 'Test IPD A');

  await mainPage.loadPage();
  await expect(mainPage.getPage().getByRole('button', {name: /Continue as Test Profile A/})).toBeVisible();

  await popupPage.createProfile('Test Profile B', 'Test IPD B');

  await mainPage.loadPage();
  await expect(mainPage.getPage().getByRole('button', {name: /Continue as Test Profile B/})).toBeVisible();
});

test('Removing profile inside the extension deactivates the profile inside the app.', async ({page, mainPage, popupPage}) => {
  await test.step('Create a profile', async () => {
    await popupPage.createProfile('A Profile', 'WebId A');
    const identities = page.locator('section#identities');
    await expect(identities).toBeVisible();

    await expect(identities.getByRole('list')).not.toBeEmpty();
    await expect(identities.locator('.identity-row')).toHaveText('A' + 'A Profile',);
  });

  await test.step('Assert app shows created profile', async () => {
    await mainPage.loadPage();
    await expect(mainPage.getPage().getByRole('button', {name: /Continue as A Profile/})).toBeVisible();
  });

  await test.step('Remove profile A in extension', async () => {
    await popupPage.openEditProfileDialog('A Profile');

    await popupPage.page.getByRole('button', {
      name: 'Delete',
    }).click();

    await popupPage.page.getByRole('button', {
      name: 'Yes',
    }).click();

    const confirmDialog = popupPage.page.locator('#confirm-dialog');
    await expect(confirmDialog).toBeHidden();

    const identities = page.locator('section#identities');
    await expect(identities.getByRole('list')).toBeEmpty();
    await expect(page.getByRole('heading', {name: 'Test Profile A'})).toBeHidden();
  });

  await test.step('Assert app does not show profile', async () => {
    await mainPage.loadPage();
    await expect(mainPage.getPage().getByRole('button', {name: /Continue as A Profile/})).toBeHidden();
  });

});

test('Clicking on the "Continue as " will redirect to login screen if active profile is not authenticated', async ({page, mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();

  await mainPage.continueAs('Test Profile A');

  await page.waitForTimeout(1000);
  await expect(await mainPage.getPage().content()).toContain('Log in');

});

test('When an active profile is authenticated, the app displays a message that the user is logged in', async ({mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();
  await mainPage.getPage().waitForTimeout(1000);

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();
});

test('Switching profiles will invalidate any active authentication session', async ({mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile B', null, 'https://pod.playground.solidlab.be/POD_NAME/profile/card#me');
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();
  await mainPage.getPage().waitForTimeout(1000);

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await popupPage.openPopup();
  await popupPage.selectProfile('Test Profile B');

  await mainPage.page.reload();
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeHidden();
});

test('Reloading the app restores the active profile', async ({mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();
  await mainPage.getPage().waitForTimeout(1000);

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await mainPage.page.reload();

  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();
});

test('Log out', async ({mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();
  await mainPage.getPage().waitForTimeout(1000);

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.page.waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await mainPage.page.getByRole('button', {name: 'Log out'}).click();
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeHidden();
});

test('Login without extension using WebID', async ({mainPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await mainPage.loadPage();
  await mainPage.getPage().waitForTimeout(1000);
  await mainPage.getPage().locator('input[name="identity"]').fill(`https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);

  await mainPage.page.getByRole('button', {name: /log in/i}).click();
  await mainPage.login();

  await mainPage.page.waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();
});

test('Displays logged in profile\'s WebID', async ({mainPage}) => {
  const WEBID = `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`;

  await mainPage.register();

  await mainPage.loadPage();
  await mainPage.getPage().locator('input[name="identity"]').fill(WEBID);

  await mainPage.page.getByRole('button', {name: /log in/i}).click();
  await mainPage.login();

  await mainPage.page.waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await expect(mainPage.getPage().locator('#webid')).toHaveText(WEBID);
});

test('Displays logged in profile\'s name if available', async ({mainPage, context}) => {
  const WEBID_ENDPOINT = `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card`;
  const WEBID = `${WEBID_ENDPOINT}#me`;
  const SOME_NAME = 'SOME_NAME';

  const RESPONSE = `@prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  @prefix TEST: <http://schema.org/>.
  
  <>
      a foaf:PersonalProfileDocument;
      foaf:maker <https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me>;
      foaf:primaryTopic <https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me>.
  
  <https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me>
      
      solid:oidcIssuer <https://pod.playground.solidlab.be/>;
      TEST:name "${SOME_NAME}" ;
      a foaf:Person.
  `;

  await context.route(WEBID_ENDPOINT, async route => {
    await route.fulfill({ contentType: 'text/turtle', body: RESPONSE });
  });

  await mainPage.register();

  await mainPage.loadPage();
  await mainPage.getPage().locator('input[name="identity"]').fill(WEBID);

  await mainPage.page.getByRole('button', {name: /log in/i}).click();
  await mainPage.login();

  await mainPage.page.waitForTimeout(1000);

  await expect(mainPage.getPage().locator('#webid')).toHaveText(WEBID);
  await expect(mainPage.getPage().locator('#name')).toHaveText(SOME_NAME);
});


baseTest('Displays info message if the extension is not installed', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('#no-extension-warning')).toHaveText("Solid Identity Extension is not installed.");
});
