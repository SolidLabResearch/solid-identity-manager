import {fetch, getDefaultSession, handleIncomingRedirect, login,} from '@inrupt/solid-client-authn-browser';
import {getSolidDataset, getStringNoLocale, getThing,} from '@inrupt/solid-client';
import {SCHEMA_INRUPT} from '@inrupt/vocab-common-rdf';
import IdentityWidget from './plugin/identity-plugin';
import {QueryEngine} from '@comunica/query-sparql';

let identityWidget;

/**
 * Sets up the login form handler, binding the input change and form submit events.
 */
const setupFormHandler = () => {
  const errorIdentity = document.querySelector('#error-identity');
  document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const {identity} = Object.fromEntries(formData);

    try {
      const idps = await getIDPsFromWebID(identity);
      if (idps.length > 0) {
        await login({
          oidcIssuer: idps?.[0],
          redirectUrl: window.location.href,
          clientName: 'Cool Solid App (showcase)',
        });
      } else {
        errorIdentity.classList.remove('hidden');
      }
    } catch (e) {
      console.log('erorr', e);
      errorIdentity.classList.remove('hidden');
    }
  });

  document.querySelector('#identity').addEventListener('input', async () => {
    if (!errorIdentity.classList.contains('hidden')) {
      errorIdentity.classList.add('hidden');
    }
  });
};

/**
 * Application-side code for demonstration purposes.
 */
const main = async () => {
  // Create new link to Chrome extension and link callback to detect changes in identity:
  identityWidget = new IdentityWidget();

  setupFormHandler();

  if (identityWidget.isExtensionInstalled) {
    identityWidget.onIdentityChanged(handleIdentityChange);
  }

  // Restore session if available:
  await handleIncomingRedirect({restorePreviousSession: true});

  // You can get a list of all identities currently available from the chrome extension:
  // const identities = await identityWidget.getIdentities();

  await updateState();
  if (!identityWidget.isExtensionInstalled) {
    document.getElementById('login-card').classList.remove('hidden');
  }
};

// Invalidates the application - purely checks whether logged in or not and updates app state based on that
const updateState = async () => {
  const noExtensionWarning = document.querySelector("#no-extension-warning")
  if (identityWidget.isExtensionInstalled) {
    noExtensionWarning.classList.add("hidden")
  }
  else {
    noExtensionWarning.classList.remove("hidden")
  }

  if (getDefaultSession().info.isLoggedIn) {
    console.log(
      '%cLOGGED IN',
      'padding: 5px; border-radius: 3px; background: #e3c; font-weight: bold; color: white',
      getDefaultSession().info,
    );
    document.getElementById('app-card').classList.remove('hidden');
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('webid').innerHTML = getDefaultSession().info.webId;

    const session = getDefaultSession();

    // Getting dataset from a specific WebID (the one that was logged in with)
    const myDataset = await getSolidDataset(session.info.webId, { fetch });

    // Getting contents at /me from the current pod
    const me = getThing(myDataset, session.info.webId);

    // Getting the name from the vcard if exists
    const name = getStringNoLocale(me, SCHEMA_INRUPT.name);

    if (name) {
      document.querySelector('dl:has(#name)').classList.remove('hidden');
      document.querySelector('#name').innerHTML = name;
    } else {
      document.querySelector('dl:has(#name)').classList.add('hidden');
    }

    // By means of an example, we forward the metadata from the pod to the extension using metadata and an update event
    identityWidget.updateProfile({
      ...identityWidget.activeIdentity,
      metadata: {
        name, // The name is also a property used by the extension to show more specific data once a user has finally logged in
      },
    });
  } else {
    document.getElementById('app-card').classList.add('hidden');
    document.getElementById('login-card').classList.remove('hidden');
  }
};

/**
 * This function is called whenever the identity changes.
 * @param {object} newIdentity - The new identity that is active.
 * @param {string} newIdentity.displayName - The identity's display name.
 */
const handleIdentityChange = async (newIdentity) => {
  // Check if data is populated, and handle it if it is.
  if (!newIdentity) {
    document.getElementById('one-click-login').classList.add('hidden');
    return;
  }

  // If you are already logged in, changing identity should also change session.
  if (getDefaultSession().info.isLoggedIn) {
    await logout();
    window.location.href = window.location.origin;
  }

  // Show the user the option to log in with this new active identity.
  document.getElementById('one-click-login').classList.remove('hidden');
  document.getElementById(
    'login-with-extension-text',
  ).innerHTML = `Continue as ${newIdentity.displayName}`;
};

/**
 * Starts the login process if not already logged in.
 * @returns {Promise<void>}
 */
const startLogin = async () => {
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: identityWidget.activeIdentity.idpOrWebID,
      redirectUrl: window.location.href,
      clientName: 'Cool Solid App (showcase)',
    });
  }
};

/**
 * Logs out of the current session.
 * @returns {Promise<void>}
 */
const logout = async () => {
  await getDefaultSession().logout();
  await updateState();
};

document
  .getElementById('login-with-extension')
  .addEventListener('click', async (e) => {
    e.preventDefault();
    await startLogin();
  });

document
  .getElementById('logout-button')
  .addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
  });

/**
 * Fetches identity providers for a given WebID.
 * @param {string} webId - The WebID.
 * @param {number} limit - The maximum number of IDPs to return.
 * @returns {Promise<string[]>} - The IDPs.
 */
async function getIDPsFromWebID(webId, limit = 1) {
  const queryEngine = new QueryEngine();
  const bindingsStream = await queryEngine.queryBindings(`
    SELECT ?idp WHERE {
      <${webId}> <http://www.w3.org/ns/solid/terms#oidcIssuer> ?idp
    } LIMIT ${limit}`,
  {
      sources: [webId],
    },
  );

  const bindings = await bindingsStream.toArray();
  return bindings.map((a) => a.get('idp').value);
}

main();
