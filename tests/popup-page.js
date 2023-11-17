export class PopupPage {
  constructor(context, page, extensionId) {
    this.context = context;
    this.page = page;
    this.extensionId = extensionId;
    this.addButton = this.page.getByRole('button', { name: 'Add' });
    this.settingsButton = this.page.locator('#settings-button');
  }

  async openPopup() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
  }

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

  async openSettings() {
    const pagePromise = this.context.waitForEvent('page');

    await this.settingsButton.click();

    const popup = await pagePromise;
    await popup.waitForLoadState();
    return popup;
  }

  async openNewProfile() {
    const pagePromise = this.context.waitForEvent('page');

    await this.addButton.click();

    const popup = await pagePromise;
    await popup.waitForLoadState();
    return popup;
  }
}
