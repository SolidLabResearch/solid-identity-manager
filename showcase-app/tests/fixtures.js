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

export const OPEN_ID_CONFIG_RESPONSE = {
  'authorization_endpoint': 'https://pod.playground.solidlab.be/.oidc/auth',
  'claims_parameter_supported': true,
  'claims_supported': [
    'azp',
    'sub',
    'webid',
    'sid',
    'auth_time',
    'iss'
  ],
  'code_challenge_methods_supported': [
    'S256'
  ],
  'end_session_endpoint': 'https://pod.playground.solidlab.be/.oidc/session/end',
  'grant_types_supported': [
    'implicit',
    'authorization_code',
    'refresh_token',
    'client_credentials'
  ],
  'id_token_signing_alg_values_supported': [
    'ES256'
  ],
  'issuer': 'https://pod.playground.solidlab.be/',
  'jwks_uri': 'https://pod.playground.solidlab.be/.oidc/jwks',
  'registration_endpoint': 'https://pod.playground.solidlab.be/.oidc/reg',
  'response_modes_supported': [
    'form_post',
    'fragment',
    'query'
  ],
  'response_types_supported': [
    'code id_token',
    'code',
    'id_token',
    'none'
  ],
  'scopes_supported': [
    'openid',
    'profile',
    'offline_access',
    'webid'
  ],
  'subject_types_supported': [
    'public'
  ],
  'token_endpoint_auth_methods_supported': [
    'client_secret_basic',
    'client_secret_jwt',
    'client_secret_post',
    'private_key_jwt',
    'none'
  ],
  'token_endpoint_auth_signing_alg_values_supported': [
    'HS256',
    'RS256',
    'PS256',
    'ES256',
    'EdDSA'
  ],
  'token_endpoint': 'https://pod.playground.solidlab.be/.oidc/token',
  'request_object_signing_alg_values_supported': [
    'HS256',
    'RS256',
    'PS256',
    'ES256',
    'EdDSA'
  ],
  'request_parameter_supported': false,
  'request_uri_parameter_supported': true,
  'require_request_uri_registration': true,
  'introspection_endpoint': 'https://pod.playground.solidlab.be/.oidc/token/introspection',
  'introspection_endpoint_auth_methods_supported': [
    'client_secret_basic',
    'client_secret_jwt',
    'client_secret_post',
    'private_key_jwt',
    'none'
  ],
  'introspection_endpoint_auth_signing_alg_values_supported': [
    'HS256',
    'RS256',
    'PS256',
    'ES256',
    'EdDSA'
  ],
  'dpop_signing_alg_values_supported': [
    'RS256',
    'PS256',
    'ES256',
    'EdDSA'
  ],
  'revocation_endpoint': 'https://pod.playground.solidlab.be/.oidc/token/revocation',
  'revocation_endpoint_auth_methods_supported': [
    'client_secret_basic',
    'client_secret_jwt',
    'client_secret_post',
    'private_key_jwt',
    'none'
  ],
  'revocation_endpoint_auth_signing_alg_values_supported': [
    'HS256',
    'RS256',
    'PS256',
    'ES256',
    'EdDSA'
  ],
  'claim_types_supported': [
    'normal'
  ]
};

