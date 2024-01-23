import {expect} from './fixtures';

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
    this.randomPodname = Math.random().toString(36).slice(2);
    this.email = `${this.randomPodname}@example.com`;
    this.password = 'password';
  }

  async loadPage() {
    await this.page.goto('http://localhost:5173');
  }

  async reload() {
    await this.page.reload();
  }

  async continueAs(profileName) {
    await this.page.getByRole('button', {name: `Continue as ${profileName}`}).click();
  }

  getPage() {
    return this.page;
  }

  async register() {
    await this.page.goto('https://pod.playground.solidlab.be/idp/register/');
    await this.page.getByLabel(/Pod name/).fill(this.randomPodname);
    await this.page.getByLabel('Email').fill(this.email);
    await this.page.getByLabel(/Password/).fill(this.password);
    await this.page.getByLabel(/Confirm password/).fill(this.password);
    await this.page.getByRole('button', {name: /Sign up/}).click();
    await expect(this.page.getByRole('heading', { name: /You've been signed up/ })).toBeVisible();
  }

  async login() {
    await this.page.getByLabel('Email').fill(this.email);
    await this.page.getByLabel(/Password/).fill(this.password);
    await this.page.getByRole('button', {name: /Log in/}).click();
    await this.page.getByRole('button', {name: /Authorize/}).click();
  }
}
