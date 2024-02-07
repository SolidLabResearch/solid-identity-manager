# Chrome Web Store publication checklist

## [Privacy](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

### Single purpose

Easily manage and switch between your Solid identities when using Solid apps.

### Permissions justification

To access most extension APIs and features, you must declare permissions in your extension's manifest.
Some permissions trigger warnings that users must allow to continue using the extension.

Requested permissions:
- activeTab: to allow access to the currently active tab when the user invokes the extension.
- storage: to be able to store user settings across sessions and browsers.
- host_permissions: any website should be able to communicate with the extension.

### Data usage

> Use the first group of checkboxes to disclose which types of data your extension collects.

Don't check any of the boxes, because we don't collect any data.

> Use the second group of checkboxes to certify that you comply with each of the disclosure statements.

Check all the boxes, because we don't do any of these things.
