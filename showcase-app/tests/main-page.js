/**
 * MainPage is a test fixture that provides a page object for the plugin's main page.
 * By simply declaring a {mainPage} argument to the test function, you get a page object that you can use to interact with.
 */
export class MainPage {
  /**
   * MainPage constructor.
   * @param {*} context - The Playwright BrowserContext.
   * @param {*} page - The Playwright Page.
   */
  constructor(context, page) {
    this.context = context;
    this.page = page;
  }

  async start() {
    await this.page.goto('http://localhost:5173');
  }

}
