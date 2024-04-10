/**
 * To communicate with the extension, we need to know its extension ID
 * A Chrome Extension ID is the first 32 characters of the SHA256 hash of a public key, where characters 0-9a-f are translated to their respective a-p counterparts.
 * The public key official public key is generated by Google as soon as the extension is uploaded to the Chrome Web Store.
 * In the meantime, we can use a temporary public key to test the extension locally with a fixed extension id.
 */
const EXTENSION_ID = 'jhojffnfpoedbmolmgnddndjhmonmhnl';
const DEBUG = true;

/**
 * This plugin serves as a (temporary or not) interface between a solid application and the identity Chrome extension.
 * The idea of this plugin is to make life easier developing a solid app that can make use of identities/profiles defined by the user in a single location.
 * Ideally the extension leverages user effort to keep profiles in one place.
 * The plugin is more a developer-experience enhancement for those developing solid apps.
 * The plugin acts as a bridget between a solid app living in the scope of a single tab to get profiles and updates from the extension.
 */
export default class IdentityPlugin {
  port;
  identityChangedHandler;
  activeIdentity;
  isExtensionInstalled = false;

  constructor() {
    this._initializeConnection();
  }

  /**
   * PRIVATE METHODS.
   */

  /**
   * Initializes the connection to the extension and sets up the required listeners for incoming messages and disconnects.
   * Requests the active identity from the extension.
   * @private
   */
  _initializeConnection = () => {
    this.port = chrome?.runtime?.connect(EXTENSION_ID);
    if (this.port) {
      this.isExtensionInstalled = true;
      this.port.onDisconnect.addListener(this._handleDisconnect);
      this.port.onMessage.addListener(this._handleMessageFromExtension);
      this.port.postMessage({ type: 'request-active-identity' });
    }
  };

  _handleDisconnect = () => {
    if (DEBUG) {
      console.log(
        '%cDISCONNECT',
        'padding: 5px; border-radius: 3px; background: #ff3333; font-weight: bold; color: white',
        'Extension got disconnected, replenishing connections...',
      );
    }

    // Long-lived connections will shut down after a longer period of inactivity. They are hydrated by opening the connection again after it is closed.
    // The idea is to only update the connection when it is absolutely needed.
    // TODO: check if there is a better Keep-alive mechanism to handle this.
    // https://github.com/KNowledgeOnWebScale/solid-authentication-browser-extension/issues/47
    this._initializeConnection();
  };

  /**
   * Handle messages sent from the extension.
   * @param {object} message - The message received from the extension.
   * @param {string} message.type - The message type.
   * @param {string} message.data - The message type.
   */
  _handleMessageFromExtension = async (message) => {
    if (DEBUG) {
      console.log(
        '%cINCOMING MESSAGE',
        'padding: 5px; border-radius: 3px; background: #3347ff; font-weight: bold; color: white',
        message,
      );
    }

    if (!message.type) {
      console.error('Non-conformal message detected, omitting...');
      return;
    }

    if (message.type === 'active-identity-response') {
      if (message.data) {
        // The received identity becomes the active one.
        this.activeIdentity = message.data;

        // Fire the change handler.
        // The Solid App can subscribe to this event to handle any changes in the app to trigger required behaviour.
        this.identityChangedHandler({
          ...this.activeIdentity,
        });
      }
    }
  };

  /**
   * PUBLIC METHODS (API).
   */

  /** @typedef {{ webID: string }} WebID*/
  /** @typedef {{ idp: string }} IDP*/
  /** @typedef {( WebID | IDP )} DataType*/
  /** @typedef {{ data: DataType }} IDP*/
  /**
   * Gets all identities currently available in the extension.
   * @returns {Promise<DataType[]>} - The identities from the extension.
   */
  getIdentities = () => {
    // This method promisifies feedback from the async flow imposed by usage of messaging ports.
    return new Promise((resolve) => {
      // handle incoming messages from the Chrome extension.
      const handleRequest = (message) => {
        if (message.type === 'all-identities-response') {
          // We resolve the promise with the required data and then perform cleanup.
          resolve(message.data);
          this.port.onMessage.removeListener(handleRequest);
        }
      };

      // Subscribe new message handler and then fire the message to the extension to kickstart the start of the entire cycle, requesting all identities.
      this.port.onMessage.addListener(handleRequest);
      this.port.postMessage({ type: 'request-identities' });
    });
  };

  /**
   * @typedef {object} Identity
   * @property {string} displayName - The display name of the identity.
   * @property {string} idpOrWebID - The IDP or WebID of the identity.
   * @property {object} metadata - Metadata of the identity.
   * @property {string} metadata.name - Name of the identity.
   */

  /**
   * Callback definition for the onIdentityChanged event.
   * @callback identityChangedCallback
   * @param {Identity} identity - The new identity that is active.
   */
  /**
   * Call this method with the function you want to execute whenever a profile change occurs.
   * @param {identityChangedCallback} callback - The callback invoked upon identity change.
   */
  onIdentityChanged = (callback) => {
    this.identityChangedHandler = callback;
  };

  /**
   * Updates the profile in the extension.
   * Call this function if you want to change a user's profile or annotate it with new data.
   * A profile can have a metadata Object { name: ? } with a name property (currently) which can then show more data coming from - for example - the pod, in the extension.
   * @param {Identity} identity - The identity to update.
   */
  updateProfile = (identity) => {
    this.port.postMessage({
      type: 'update-profile',
      data: {
        ...identity,
      },
    });
  };
}
