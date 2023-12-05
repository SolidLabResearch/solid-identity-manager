let availableIdentities = [];
let internalPort;
let activeIdentity;

const addProfileScreen = {
  displayName: document.querySelector('#add-profile-dialog input[name=displayname]'),
  idp: document.querySelector('#add-profile-dialog input[name=idp]'),
  webID: document.querySelector('#add-profile-dialog input[name=webid]'),
  colors: document.querySelectorAll('#add-profile-dialog input[name=color]'),
  form: document.querySelector('#add-profile-dialog form'),
  close: document.querySelector('#add-profile-dialog .close-button'),
  avatar: document.querySelector('#add-profile-dialog .avatar'),
  dialog: document.querySelector('#add-profile-dialog')
};

/**
 * Initializes the add profile screen.
 * Binds event listeners to the input fields and to the form.
 */
const initAddProfileScreen = () => {
  const ipdError = document.querySelector('#idp_error');
  const webidError = document.querySelector('#webid_error');
  const displayNameError = document.querySelector('#displayname_error');

  const { displayName, idp, webID, form, close, dialog, colors, avatar } = addProfileScreen;
  displayName.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 0) {
      displayName.classList.remove('error');
      avatar.innerHTML = e.target.value.trim().charAt(0).toUpperCase();
    }
  });
  for (const input of [idp, webID]) {
    input.addEventListener('input', (e) => {
      if (e.target.value.trim().length > 0) {
        idp.classList.remove('error');
        ipdError.textContent = '';
        webID.classList.remove('error');
        webidError.textContent = '';
      }
    });
  }

  const inputListener = e => [idp, webID].filter(input => input !== e.target).forEach(input => {
    input.required = !e.target.value.trim().length;
    input.disabled = !!e.target.value.trim().length;
  });
  [idp, webID].forEach(i => i.addEventListener('input', inputListener));

  colors.forEach(
    (input) => input.addEventListener('change', () => document.querySelector('#avatar').style.backgroundColor = input.value)
  );

  close.addEventListener('click', () => {
    dialog.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    let isValid = true;
    if (displayName.value.trim().length === 0) {
      displayName.classList.add('error');
      displayNameError.textContent = 'You must provide a display name';
      isValid = false;
    }
    if (webID.value.trim().length === 0 && idp.value.trim().length === 0) {
      webID.classList.add('error');
      idp.classList.add('error');
      ipdError.textContent = 'Please provide either an Identity Provider or WebID';
      webidError.textContent = 'Please provide either an Identity Provider or WebID';
      isValid = false;
    }
    if (isValid) {
      const profile = {
        color: { id: data.color, color: 'white', background: data.color },
        displayName: data.displayname,
        idp: data.idp || '',
        webID: data.webid || '',
      };
      internalPort.postMessage({
        type: 'create-profile',
        data: profile,
      });
      const list = document.getElementById('identity-list');
      const identityRow = createIdentityRow(profile);
      list.appendChild(identityRow);

      dialog.close();
    }
  });
};

const main = () => {
  internalPort = chrome.runtime.connect({ name: 'popup' });
  internalPort.onMessage.addListener(handleInternalMessage);
  internalPort.postMessage({ type: 'request-identities' });
  internalPort.postMessage({ type: 'request-active-identity' });

  document
    .getElementById('add-identity-button')
    .addEventListener('click', () => {
      clearError();
      addProfileScreen.avatar.innerHTML = '?';
      addProfileScreen.avatar.style.background = addProfileScreen.colors[0].value;
      addProfileScreen.form.reset();
      addProfileScreen.idp.disabled = false;
      addProfileScreen.webID.disabled = false;
      addProfileScreen.dialog.showModal();
    });

  document.getElementById('settings-button').addEventListener('click', () => {
    openSettings();
  });

  document.getElementById('close-error-button').addEventListener('click', () => {
    document.getElementById('error-message-container').classList.add('hidden');
  });

  initAddProfileScreen();
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

/**
 * Clears the error message and hides its container.
 */
const clearError = () => {
  const container = document.getElementById('error-message-container');
  container.classList.add('hidden');

  const paragraph = document.getElementById('error-message-text');
  paragraph.innerHTML = '';
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
    const { data: {displayName} } = message;
    handleError(`Unable to retrieve IDP from WebID for ${displayName}.`);
  }

  if (message.type === 'all-identities-response') {
    availableIdentities = message.data;
    const list = document.getElementById('identity-list');
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    if (availableIdentities.length === 0) {
      document.getElementById('no-identities-prompt').classList.remove('hidden');
    }

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
    clearError();
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
