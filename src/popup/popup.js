let availableIdentities = [];
let internalPort;
let activeIdentity;
let profileModus = 'create';

/**
 * Initializes the add / edit profile screen.
 * If an identity is provided, the screen is initialized in edit mode.
 * Binds event listeners to the input fields and to the form.
 * @param {object} [identity] - Optional identity to initialize the screen with.
 * @param {string} [identity.displayName] - The identity's display name.
 * @param {string} [identity.idp] - The profile's IDP.
 * @param {string} [identity.webID] - The profile's WebID.
 * @param {object} [identity.color] - The profile's color preference.
 * @param {string} [identity.color.id] - The profile's color identifier.
 * @param {string} [identity.color.color] - The profile's foreground color preference.
 * @param {string} [identity.color.background] - The profile's background color preference.
 */
const initProfileDialog = (identity) => {
  const profileDialog = document.querySelector('#profile-dialog');
  const displayName = profileDialog.querySelector('input[name=displayname]');
  const idp = profileDialog.querySelector('input[name=idp]');
  const webID = profileDialog.querySelector('input[name=webid]');
  const colors = profileDialog.querySelectorAll('input[name=color]');
  const form = profileDialog.querySelector('form');
  const avatar = profileDialog.querySelector('.avatar');

  if (identity) {
    profileDialog.querySelector('h1').innerHTML = 'Edit Profile';
    profileDialog.classList.add('update');
    profileDialog.classList.remove('create');

    displayName.value = identity.displayName;
    idp.value = identity.idp;
    webID.value = identity.webID;
    avatar.innerHTML = identity.displayName.charAt(0).toUpperCase();
    avatar.style.backgroundColor = identity.color.background;
    avatar.style.color = identity.color.color;

    profileDialog.querySelector(`.color-selection input[value=${identity.color.id}]`).checked = true;

    idp.disabled = !!identity.webID;
    webID.disabled = !!identity.idp;
  } else {
    profileDialog.querySelector('h1').innerHTML = 'Add new profile';
    profileDialog.classList.add('create');
    profileDialog.classList.remove('update');

    avatar.innerHTML = '?';
    avatar.style.background = colors[0].value;
    form.reset();
    idp.disabled = false;
    webID.disabled = false;
  }
};

/**
 * Submit handler for the profile dialog.
 * Can handle both profile create and profile update forms.
 * @param {Event} e - The submit event.
 */
const handleProfileDialogSubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  let isValid = true;

  const profileDialog = document.querySelector('#profile-dialog');

  const displayNameInput = profileDialog.querySelector('input[name=displayname]');
  const webidInput = profileDialog.querySelector('input[name=webid]');
  const idpInput = profileDialog.querySelector('input[name=idp]');

  if (displayNameInput.value.trim().length === 0) {
    profileDialog.querySelector('input[name=displayname]').classList.add('error');
    profileDialog.querySelector('input[name=displayname] + .error-explanation').textContent = 'You must provide a display name.';
    isValid = false;
  }
  if (webidInput.value.trim().length === 0 && idpInput.value.trim().length === 0) {
    profileDialog.querySelector('input[name=webid]').classList.add('error');
    profileDialog.querySelector('input[name=idp]').classList.add('error');
    profileDialog.querySelector('input[name=webid] + .error-explanation').textContent = 'Please provide either an Identity Provider or WebID.';
    profileDialog.querySelector('input[name=idp] + .error-explanation').textContent = 'Please provide either an Identity Provider or WebID.';
    isValid = false;
  }
  if (isValid) {
    const profile = {
      id: profileModus === 'create' ? undefined : activeIdentity.id,
      color: {id: data.color, color: 'white', background: data.color},
      displayName: data.displayname,
      idp: data.idp || '',
      webID: data.webid || '',
    };

    internalPort.postMessage({
      type: profileModus === 'create' ? 'create-profile' : 'update-profile',
      data: profile,
    });

    // sync state after update
    internalPort.postMessage({type: 'request-identities'});
    internalPort.postMessage({type: 'request-active-identity'});

    profileDialog.close();
  }
};

/**
 * Wire up the events for the profile dialog.
 */
const bindProfileDialogEvents = () => {
  const profileDialog = document.querySelector('#profile-dialog');
  const confirmDialog = document.querySelector('#confirm-dialog');

  const form = profileDialog.querySelector('form');
  const avatar = profileDialog.querySelector('.avatar');

  const displayName = profileDialog.querySelector('input[name=displayname]');
  const idp = profileDialog.querySelector('input[name=idp]');
  const webID = profileDialog.querySelector('input[name=webid]');
  const colors = profileDialog.querySelectorAll('input[name=color]');

  const displayNameError = profileDialog.querySelector('input[name=displayname] + .error-explanation');
  const webidError = profileDialog.querySelector('input[name=webid] + .error-explanation');
  const ipdError = profileDialog.querySelector('input[name=idp] + .error-explanation');

  const closeButton = profileDialog.querySelector('.close-button');
  const deleteButton = profileDialog.querySelector('#delete-button');
  const confirmDeleteButton = confirmDialog.querySelector('#confirm-delete-button');
  const cancelDeleteButton = confirmDialog.querySelector('#cancel-delete-button');

  displayName.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 0) {
      displayName.classList.remove('error');
      avatar.innerHTML = e.target.value.trim().charAt(0).toUpperCase();
      displayNameError.textContent = '';
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

  // colors.forEach(
  //   (input) => input.addEventListener('change', () => avatar.style.backgroundColor = input.value)
  // );

  closeButton.addEventListener('click', () => {
    profileDialog.close();
  });

  form.addEventListener('submit', handleProfileDialogSubmit);

  deleteButton.addEventListener('click', e => {
    e.preventDefault();
    confirmDialog.showModal();
  });

  cancelDeleteButton.addEventListener('click', () => confirmDialog.close());
  confirmDeleteButton.addEventListener('click', () => {
    confirmDialog.close();
    profileDialog.close();
    internalPort.postMessage({
      type: 'delete-profile',
      data: activeIdentity,
    });
    internalPort.postMessage({type: 'request-identities'});
    internalPort.postMessage({type: 'request-active-identity'});
  });
};

/**
 * The main script that gets fired when the popup is opened.
 */
const main = () => {
  internalPort = chrome.runtime.connect({name: 'popup'});
  internalPort.onMessage.addListener(handleInternalMessage);
  internalPort.postMessage({type: 'request-identities'});
  internalPort.postMessage({type: 'request-active-identity'});

  document
    .getElementById('add-identity-button')
    .addEventListener('click', () => {
      profileModus = 'create';
      clearError();
      const dialog = document.querySelector('#profile-dialog');
      initProfileDialog();
      dialog.showModal();
    });

  document.getElementById('close-error-button').addEventListener('click', () => {
    document.getElementById('error-message-container').classList.add('hidden');
  });

  bindProfileDialogEvents();
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

  console.log('%cmessage', 'color:yellow; background:green; padding: 4px;', message);

  if (message.type === 'active-identity-response') {
    setActiveIdentity(message.data);

    return;
  }

  if (message.type === 'active-identity-response-error') {
    const {data: {displayName}} = message;
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

    if (activeIdentity && !availableIdentities.find(i => i.id === activeIdentity.id)) {
      setActiveIdentity(null);
    }
  }
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

  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  const editIcon = document.createElement('img');
  editIcon.src = 'settings-cog.svg';
  editButton.addEventListener('click', () => {
    profileModus = 'update';
    activeIdentity = identity;
    const dialog = document.querySelector('#profile-dialog');
    dialog.showModal();
    initProfileDialog(identity);
  });

  editButton.appendChild(editIcon);

  identityRow.appendChild(button);
  identityRow.appendChild(editButton);

  return identityRow;
};

const setActiveIdentity = (identity) => {
  activeIdentity = identity;
  document.getElementById('no-identities-prompt').classList.add('hidden');

  const identityHeader = document.getElementById('identity-header');
  if (identity) {
    document.getElementById('identity-short').innerHTML = identity.displayName;
    const avatar = identityHeader.querySelector('.avatar');

    if (identity.metadata?.name) {
      document.getElementById('full-name').innerHTML = identity.metadata.name;
    } else {
      document.getElementById('full-name').innerHTML = '';
    }
    avatar.innerHTML = identity.displayName[0];
    avatar.setAttribute(
      'style',
      `background-color: ${identity.color.background}; color: ${identity.color.color}`,
    );
    identityHeader.classList.remove('hidden');
  }
  else {
    identityHeader.classList.add('hidden');
  }
};

main();
