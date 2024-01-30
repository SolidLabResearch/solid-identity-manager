# Chrome Web Store publication checklist

## Permission justification

To access most extension APIs and features, you must declare permissions in your extension's manifest. 
Some permissions trigger warnings that users must allow to continue using the extension.

Requested permissions:
1. **activeTab**
   
    justification: to allow access to the currently active tab when the user invokes the extension. 
2. **storage**:

    justification: to be able to store user settings across sessions and browsers.
3. **host_permissions**

    justification: any website should be able to communicate with the extension.


