/**
 * PopupPage is a test fixture that provides a page object for the extension's popup.
 * By simply declaring a {popup} argument to the test function, you get a page object that you can use to interact with.
 */
export class PopupPage {
  /**
   * PopupPage constructor.
   * @param {*} context - The Playwright BrowserContext.
   * @param {*} page - The Playwright Page.
   * @param {string} extensionId - The extension ID.
   */
  constructor(context, page, extensionId) {
    this.context = context;
    this.page = page;
    this.extensionId = extensionId;
    this.addButton = this.page.getByRole('button', { name: 'Add' });
    this.settingsButton = this.page.locator('#settings-button');
  }

  /**
   * Navigates to the extension's popup.
   */
  async openPopup() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
  }

  /**
   * Creates a profile with either an IDP or a WebID.
   * @param {string} profileName - The profile name.
   * @param {string} idp - The IDP.
   * @param {string} webId - The WebID.
   */
  async createProfile(profileName, idp, webId) {
    await this.openPopup();
    const pagePromise = this.context.waitForEvent('page');

    await this.addButton.click();

    const popup = await pagePromise;
    await popup.waitForLoadState();

    await popup.locator('#display-name').fill(profileName);
    if (idp) {
      await popup.locator('#idp').fill(idp);
    }
    else if (webId) {
      await popup.locator('#webid').fill(webId);
    }

    await popup.waitForTimeout(1000);
    await popup.getByRole('button', { name: 'Create' }).click();

    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
    await this.page.waitForTimeout(1000);
    await this.page.reload();
  }

  /**
   * Selects a profile in the extension.
   * @param {string} profileName - The profile name.
   */
  async selectProfile(profileName) {
    await this.openPopup();
    await this.page.getByRole('button', { name: profileName }).click();
  }

  /**
   * Opens the settings page by clicking on the settings icon button on the popup page.
   * @returns {Promise<*>} Returns a promise of the settings page.
   */
  async openSettings() {
    const pagePromise = this.context.waitForEvent('page');

    await this.settingsButton.click();

    const popup = await pagePromise;
    await popup.waitForLoadState();
    return popup;
  }

  /**
   * Opens the create profile page by clicking on the add button on the popup page.
   * @returns {Promise<*>} Returns a promise of the popup page.
   */
  async openNewProfile() {
    const pagePromise = this.context.waitForEvent('page');

    await this.addButton.click();

    const popup = await pagePromise;
    await popup.waitForLoadState();
    return popup;
  }
}
