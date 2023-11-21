import {test, expect} from './fixtures';

test('popup page has title', async ({page, popupPage}) => {
  await popupPage.openPopup();
  await expect(page).toHaveTitle(/Solid Identity Selector/);
});

test('popup page without profiles', async ({page, popupPage}) => {
  await popupPage.openPopup();
  await expect(page.locator('p').first()).toHaveText('You have not selected a profile yet.');
  const identities = page.locator('section#identities');

  await expect(identities.getByRole('list')).toBeEmpty();

  await expect(page.getByRole('button', {name: 'Add'})).toBeVisible();
});

test('add button opens add-new-profile page', async ({ page, popupPage, context}) => {
  await popupPage.openPopup();

  const pagePromise = context.waitForEvent('page');

  await page.getByRole('button', {name: 'Add'}).click();

  const popup = await pagePromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveTitle(/Add a new SOLID profile/);

  await expect(popup.getByRole('heading', {
    name: 'Add new profile',
  }),).toBeVisible();
});

test('add new profile page has all necessary input fields', async ({  popupPage}) => {
  const page = await popupPage.openNewProfile();

  const displayName = page.locator('#display-name');
  await expect(displayName).toBeVisible();
  await expect(displayName).toBeEditable();
  await expect(displayName).toBeEmpty();
  const displayNamePlaceholder = await displayName.getAttribute('placeholder');
  expect(displayNamePlaceholder).toEqual('The name in the list');

  const idp = page.getByRole('textbox', {name: 'idp'});
  await expect(idp).toBeVisible();
  await expect(idp).toBeEditable();
  await expect(idp).toBeEmpty();
  const idpPlaceholder = await idp.getAttribute('placeholder');
  expect(idpPlaceholder).toEqual('Solid identity provider');

  const webid = page.getByRole('textbox', {name: 'webid'});
  await expect(webid).toBeVisible();
  await expect(webid).toBeEditable();
  await expect(webid).toBeEmpty();
  const webidPlaceholder = await webid.getAttribute('placeholder');
  expect(webidPlaceholder).toEqual("Your pod's WebID");
});

test('when create a profile, IDP and WebID fields are mutually exclusive', async ({  popupPage}) => {
  const page = await popupPage.openNewProfile();

  const idp = page.getByRole('textbox', {name: 'idp'});
  await expect(idp).toBeEditable();

  const webid = page.getByRole('textbox', {name: 'webid'});
  await expect(webid).toBeEditable();

  await idp.fill('IDP');
  await expect(webid).toBeDisabled();

  await idp.clear();
  await expect(webid).toBeEditable();

  await webid.fill('WebID');
  await expect(idp).toBeDisabled();

  await webid.clear();
  await expect(idp).toBeEditable();
});

test('create profile validates empty fields', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/identity-creation.html`);

  const displayName = page.locator('#display-name');
  await expect(displayName).toBeEmpty();
  const webid = page.locator('#webid');
  await expect(webid).toBeEmpty();
  const idp = page.locator('#idp');
  await expect(idp).toBeEmpty();

  await page.getByRole('button', {name: 'Create'}).click();

  await expect(displayName).toHaveClass('error');
  await expect(page.getByText('You must provide a display name')).toBeVisible();
  await expect(webid).toHaveClass('error');
  await expect(page.locator('#webid-error')).toHaveText('Please provide either an Identity Provider or WebID',);
  await expect(idp).toHaveClass('error');
  await expect(page.locator('#idp-error')).toHaveText('Please provide either an Identity Provider or WebID',);
});

test('creating a profile adds it to list of profiles', async ({ page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'WebId A');

  await page.waitForTimeout(1000);
  const identities = page.locator('section#identities');
  await expect(identities).toBeVisible();

  await expect(identities.getByRole('list')).not.toBeEmpty();
  await expect(identities.locator('.identity-row')).toHaveText('A' + 'A Profile',);
});

test('creating 2 profiles adds both to list of profiles', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'WebId A');
  await popupPage.createProfile('B Profile', 'WebId B');

  const identities = page.locator('section#identities');
  await expect(identities).toBeVisible();

  await expect(identities.locator('.identity-row')).toHaveCount(2);
  await expect(identities.locator('.identity-row').first()).toHaveText('A' + 'A Profile',);
  await expect(identities.locator('.identity-row').last()).toHaveText('B' + 'B Profile',);
});

test('profile header shows name and avatar of active profile', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'WebId A');
  await expect(page.locator('#identity-short')).toHaveText('A Profile');

  await popupPage.createProfile('B Profile', 'WebId B');
  await expect(page.locator('#identity-short')).toHaveText('B Profile');
});

test('switching profile activates correct one', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');
  await popupPage.createProfile('B Profile', 'IDP B');
  await popupPage.createProfile('C Profile', 'IDP C');

  await expect(page.locator('#identity-short')).toHaveText('C Profile');

  const identities = page.locator('section#identities');

  await identities.getByRole('button', {
    name: 'A Profile',
  }).click();
  await expect(page.getByRole('heading', {name: 'A Profile'}),).toBeVisible();

  await identities.getByRole('button', {
    name: 'B Profile',
  }).click();
  await expect(page.getByRole('heading', {name: 'B Profile'}),).toBeVisible();

  await identities.getByRole('button', {
    name: 'C Profile',
  }).click();
  await expect(page.getByRole('heading', {name: 'C Profile'}),).toBeVisible();
});

test('manage profiles popup display empty list if no profiles exist', async ({popupPage}) => {
  const settingsPage = await popupPage.openSettings();

  await expect(settingsPage).toHaveTitle(/Manage SOLID profiles/);
  await expect(settingsPage.getByRole('heading', {
    name: 'Your profiles',
  }),).toBeVisible();

  await expect(settingsPage.locator('#identity-list .identity-box')).toHaveCount(0);
});

test('manage profiles popup displays all profiles', async ({ popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');
  await popupPage.createProfile('B Profile', 'IDP B');

  const settingsPage = await popupPage.openSettings();

  await expect(settingsPage.locator('#identity-list .identity-box')).toHaveCount(2);
  await expect(settingsPage.locator('#identity-list .identity-box').first()).toHaveText('A' + 'A Profile',);
  await expect(settingsPage.locator('#identity-list .identity-box').last()).toHaveText('B' + 'B Profile',);

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();
});

test('clicking delete profile button shows confirmation dialog', async ({ popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  const confirmDialog = settingsPage.locator('#confirm-dialog');
  await expect(confirmDialog).toBeHidden();

  await settingsPage.getByRole('button', {
    name: 'Delete',
  }).click();

  await expect(confirmDialog).toBeVisible();
  await expect(settingsPage.getByRole('heading', {
    name: 'Are you sure?',
  }),).toBeVisible();

  await expect(settingsPage.getByRole('button', {
    name: 'Yes',
  }),).toBeVisible();
  await expect(settingsPage.getByRole('button', {
    name: 'No',
  })).toBeVisible();
});

test('dismissing confirmation dialog for deletion closes the dialog and does not remove the profile', async ({popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  await settingsPage.getByRole('button', {
    name: 'Delete',
  }).click();

  await settingsPage.getByRole('button', {
    name: 'No',
  }).click();

  const confirmDialog = settingsPage.locator('#confirm-dialog');
  await expect(confirmDialog).toBeHidden();

  await expect(settingsPage.getByRole('button', {
    name: 'A Profile',
  })).toBeVisible();
});

test('confirming profile deletion removes the profile', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
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
    name: 'A Profile',
  })).toHaveCount(0);

  await page.reload();

  // profile was removed from main popup page
  const identities = page.locator('section#identities');
  await expect(identities.getByRole('list')).toBeEmpty();
});

test('editing profile changes its attributes on settings and main page', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  await expect(settingsPage.locator('#avatar')).toHaveText('A');

  await settingsPage.locator('#display-name').fill('X Profile Edited');

  await expect(settingsPage.locator('#avatar')).toHaveText('X');

  await settingsPage.getByRole('button', {
    name: 'Save',
  }).click();

  // profile was changed on the settings page
  await expect(settingsPage.getByRole('button', {
    name: 'X Profile Edited',
  })).toBeVisible();

  await page.reload();

  // profile was edited on main popup page
  const identities = page.locator('section#identities');
  await expect(identities.locator('.identity-row').first()).toHaveText('X' + 'X Profile Edited',);
});

test('profile colors can be changed', async ({page, popupPage}) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  const avatar = settingsPage.locator('#avatar');
  const originalProfileColor = await avatar.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));

  const lastColorButton = settingsPage.locator('#color-selection button').last();
  const lastColorOption = await lastColorButton.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));
  expect(originalProfileColor).not.toEqual(lastColorOption);

  await lastColorButton.click();

  const newProfileColor = await avatar.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));
  expect(newProfileColor).toEqual(lastColorOption);

  await settingsPage.getByRole('button', {
    name: 'Save',
  }).click();

  const settingsAvatar = settingsPage.locator('.identity-box .avatar');
  const settingsAvatarColor = await settingsAvatar.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));
  expect(settingsAvatarColor).toEqual(lastColorOption);

  await page.reload();

  const mainAvatar = page.locator('#identity-header .avatar');
  const mainAvatarColor = await mainAvatar.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));
  expect(mainAvatarColor).toEqual(lastColorOption);

  const profileListAvatar = page.locator('#identity-list .avatar');
  const profileListAvatarColor = await profileListAvatar.evaluate((el) => window.getComputedStyle(el).getPropertyValue('background-color'));
  expect(profileListAvatarColor).toEqual(lastColorOption);
});

test('when editing a profile, IDP and WebID fields are mutually exclusive', async ({ popupPage }) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  const idp = settingsPage.locator('#idp');
  await expect(idp).toBeEditable();

  const webid = settingsPage.locator('#webid');
  await expect(webid).toBeDisabled();

  await idp.clear();
  await expect(webid).toBeEditable();

  await webid.fill('WebID');
  await expect(idp).toBeDisabled();

  await webid.clear();
  await expect(idp).toBeEditable();
});

test('edits of IDP are persisted', async ({ popupPage }) => {
  await popupPage.createProfile('A Profile', 'IDP A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  const idp = settingsPage.locator('#idp');
  await expect(idp).toHaveValue('IDP A');

  await idp.fill('NEW IDP');

  await settingsPage.getByRole('button', {
    name: 'Save',
  }).click();

  await (settingsPage.getByRole('button', {
    name: 'A Profile',
  })).click();

  await expect(idp).toHaveValue('NEW IDP');
});

test('edits of WebID are persisted', async ({ popupPage }) => {
  await popupPage.createProfile('A Profile', null, 'WEBID A');

  const settingsPage = await popupPage.openSettings();

  await settingsPage.getByRole('button', {
    name: 'A Profile',
  }).click();

  const webid = settingsPage.locator('#webid');
  await expect(webid).toHaveValue('WEBID A');

  await webid.fill('NEW WEBID');

  await settingsPage.getByRole('button', {
    name: 'Save',
  }).click();

  await (settingsPage.getByRole('button', {
    name: 'A Profile',
  })).click();

  await expect(webid).toHaveValue('NEW WEBID');
});
