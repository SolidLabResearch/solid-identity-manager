let availableIdentities = [];
let internalPort;
let activeIdentity;

const main = () => {
  internalPort = chrome.runtime.connect({ name: 'popup' });
  internalPort.onMessage.addListener(handleInternalMessage);
  internalPort.postMessage({ type: 'request-identities' });
  internalPort.postMessage({ type: 'request-active-identity' });

  document
    .getElementById('add-identity-button')
    .addEventListener('click', () => {
      createNewIdentity();
    });

  document.getElementById('settings-button').addEventListener('click', () => {
    openSettings();
  });

  document.getElementById('close-error-button').addEventListener('click', () => {
    document.getElementById('error-message-container').classList.add('hidden');
  });
};

/**
 * Displays the error message container and sets the message text.
 * @param {string} message - The message to display.
 */
const handleError = (message) => {
  const container = document.getElementById('error-message-container');
  container.classList.remove('hidden');

  const paragraph = document.getElementById('error-message-text');
  paragraph.innerText = message;
};

const handleInternalMessage = (message) => {
  if (!message.type) {
    console.error('Non-conformal message detected, omitting...');
    return;
  }

  if (message.type === 'active-identity-response') {
    setActiveIdentity(message.data);

    return;
  }

  if (message.type === 'active-identity-response-error') {
    handleError('Unable to retrieve IDP from WebID.');
  }

  if (message.type === 'all-identities-response') {
    availableIdentities = message.data;
    const list = document.getElementById('identity-list');

    availableIdentities.forEach((identity) => {
      const identityRow = createIdentityRow(identity);
      list.appendChild(identityRow);

      if (activeIdentity && identity.id === activeIdentity.id) {
        if (identity.metadata?.name) {
          document.getElementById('full-name').innerHTML =
            identity.metadata.name;
        } else {
          document.getElementById('full-name').innerHTML = '';
        }
      }
    });

    return;
  }
};

const openSettings = () => {
  createCenteredPopup(720, 720, {
    url: chrome.runtime.getURL('settings.html'),
    type: 'popup',
  });
};

const createNewIdentity = () => {
  createCenteredPopup(420, 640, {
    url: chrome.runtime.getURL('identity-creation.html'),
    type: 'popup',
  });
};

const createCenteredPopup = (width, height, options) => {
  const left = screen.width / 2 - width / 2;
  const top = screen.height / 2 - height / 2;

  chrome.windows.create({
    ...options,
    width,
    height,
    left,
    top,
  });
};

const createIdentityRow = (identity) => {
  const identityRow = document.createElement('li');
  identityRow.classList.add('identity-row');
  const button = document.createElement('button');

  const avatar = document.createElement('span');
  avatar.classList.add('avatar', 'small');
  avatar.setAttribute(
    'style',
    `background-color: ${identity.color.background}; color: ${identity.color.color}`,
  );
  const displayName = document.createElement('span');

  avatar.innerHTML = identity.displayName.charAt(0);
  displayName.innerHTML = identity.displayName;

  button.appendChild(avatar);
  button.appendChild(displayName);

  button.addEventListener('click', () => {
    internalPort.postMessage({
      type: 'set-active-identity',
      data: identity,
    });
  });

  identityRow.appendChild(button);

  return identityRow;
};

const setActiveIdentity = (identity) => {
  activeIdentity = identity;
  document.getElementById('no-identities-prompt').classList.add('hidden');
  document.getElementById('identity-short').innerHTML = identity.displayName;

  console.log(identity);

  if (identity.metadata?.name) {
    document.getElementById('full-name').innerHTML = identity.metadata.name;
  } else {
    document.getElementById('full-name').innerHTML = '';
  }

  const identityHeader = document.getElementById('identity-header');
  const avatar = identityHeader.querySelector('.avatar');
  avatar.innerHTML = identity.displayName[0];
  avatar.setAttribute(
    'style',
    `background-color: ${identity.color.background}; color: ${identity.color.color}`,
  );
  identityHeader.classList.remove('hidden');
};

main();
