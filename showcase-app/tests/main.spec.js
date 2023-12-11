import {test, expect, OPEN_ID_CONFIG_RESPONSE} from './fixtures';

const WEBID_ENDPOINT = 'https://pod.playground.solidlab.be/serge1/profile/card#me';

const WEBID_RESPONSE = `@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>.

<>
    a foaf:PersonalProfileDocument;
    foaf:maker <https://pod.playground.solidlab.be/serge1/profile/card#me>;
    foaf:primaryTopic <https://pod.playground.solidlab.be/serge1/profile/card#me>.

<https://pod.playground.solidlab.be/serge1/profile/card#me>
    
    solid:oidcIssuer <https://pod.playground.solidlab.be/>;
    a foaf:Person.`;

const authFile = 'user.json';

test('authenticate', async ({ page }) => {
  // Perform authentication steps.
  const id = test.info().parallelIndex;
  await page.goto('https://pod.playground.solidlab.be/idp/register/');
  await page.getByLabel(/Pod name/).fill('MY_POD_NAMExx' + id);
  await page.getByLabel('Email').fill('xx@example.com');
  await page.getByLabel(/Password/).fill('password');
  await page.getByLabel(/Confirm password/).fill('password');
  await page.getByRole('button', {name: /Sign up/}).click();

  // Wait for success page
  await expect(page.getByRole('heading', { name: /You've been signed up/ })).toBeVisible();

  await page.context().storageState({ path: authFile });
});

test('page has correct title', async ({page}) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Solid Auth Showcase/);
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

test('Removing profile inside the extension deactivates the profile', async ({page, mainPage, popupPage}) => {
  await test.step('Create profile A', async () => {
    await popupPage.openPopup();
    await popupPage.createProfile('Test Profile A', 'Test IPD A');
  });

  await test.step('Assert app shows profile A', async () => {
    await mainPage.loadPage();
    await expect(mainPage.getPage().getByRole('button', {name: /Continue as Test Profile A/})).toBeVisible();
  });

  await test.step('Remove profile A in extension', async () => {
    await popupPage.openPopup();
    const settingsPage = await popupPage.openSettings();

    await settingsPage.getByRole('button', {
      name: 'Test Profile A',
    }).click();
    await settingsPage.getByRole('button', {
      name: 'Delete',
    }).click();

    await settingsPage.getByRole('button', {
      name: 'Yes',
    }).click();

    const confirmDialog = settingsPage.locator('#confirm-dialog');
    await expect(confirmDialog).toBeHidden();

    // profile was removed from settings page
    await expect(settingsPage.getByRole('button', {
      name: 'Test Profile A',
    })).toHaveCount(0);

    await page.reload();
  });

  const identities = page.locator('section#identities');
  await expect(identities.getByRole('list')).toBeEmpty();
  await expect(page.getByRole('heading', {name: 'Test Profile A'})).toBeHidden();

  await test.step('Assert app does not show profile A', async () => {
    await mainPage.loadPage();
    await expect(mainPage.getPage().getByRole('button', {name: /Continue as Test Profile A/})).toBeHidden();
  });

});

test('Clicking on the "Continue as " will redirect to login screen if active profile is not authenticated', async ({page, mainPage, popupPage, context}) => {
  await context.route(WEBID_ENDPOINT, async route => {
    await route.fulfill({contentType: 'application/trig', body: WEBID_RESPONSE});
  });
  await context.route('https://pod.playground.solidlab.be/.well-known/openid-configuration', async route => {
    await route.fulfill({contentType: 'application/json', json: OPEN_ID_CONFIG_RESPONSE});
  });
  await context.route(`${OPEN_ID_CONFIG_RESPONSE.authorization_endpoint}?*`, async route => {
    await route.fulfill({contentType: 'text/html', body: 'SUCCESS'});
  });

  await mainPage.loadPage();
  await page.waitForTimeout(1000);

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, WEBID_ENDPOINT);
  await popupPage.selectProfile('Test Profile A');

  await page.waitForTimeout(1000);

  await mainPage.continueAs('Test Profile A');

  await page.waitForTimeout(1000);
  await expect(await mainPage.getPage().content()).toContain('SUCCESS');

});

test('When an active profile is authenticated, the app displays a message that the user is logged in', async ({ mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();
  // await page.context().storageState({ path: authFile });
});

test('Switching profiles will invalidate any active authentication session', async ({mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile B', null, 'https://pod.playground.solidlab.be/POD_NAME/profile/card#me');
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await popupPage.openPopup();
  await popupPage.selectProfile('Test Profile B');

  await mainPage.page.reload();
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeHidden();
});

test('Reloading the app restores the active profile', async ({ mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.getPage().waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await mainPage.page.reload();

  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();
});

test('Log out', async ({ mainPage, popupPage}) => {
  await mainPage.loadPage();
  await mainPage.register();

  await popupPage.openPopup();
  await popupPage.createProfile('Test Profile A', null, `https://pod.playground.solidlab.be/${mainPage.randomPodname}/profile/card#me`);
  await popupPage.selectProfile('Test Profile A');

  await mainPage.loadPage();

  await mainPage.continueAs('Test Profile A');
  await mainPage.login();

  await mainPage.page.waitForTimeout(1000);
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeVisible();

  await mainPage.page.getByRole('button', {name: 'Log out'}).click();
  await expect(mainPage.getPage().getByRole('heading', {name: 'Logged In!'})).toBeHidden();

});
