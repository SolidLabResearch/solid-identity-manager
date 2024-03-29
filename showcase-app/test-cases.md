# End-to-End Test Documentation

This document provides an overview of the end-to-end tests for the plugin.

### How to run the tests

To run end-to-end tests, you must first have built the plugin (run `npm run build` inside the project root directory).
Then you run the tests via `npm test`.
If you want to run the tests interactively, you use `npm run test:ui`.

## Test Cases

### 1. Page has title and headlines

- **Description**: Tests if the main page has the correct title and header.
- **Test Steps**:
  - Open the main page.
  - Check if the page title matches "Solid Auth Showcase".
  - Check if the page main headline matches "COOL SOLID APP".
  - Check if the page sub headline matches "Log in with your Solid Identity".

### 2. Page shows error message when extension is not available

- **Description**: Tests if the app displays an error message when it cannot make a connection to the Solid Identity Extension.
- **Test Steps**:
  - Assert the extension is not available. 
  - Open the main page.
  - Verify that a message indicates that no connection can be made to the extension.

### 3. Default state with no active profile

- **Description**: Tests if the default state (no active profile) of the page is correct.
- **Test Steps**:
  - Open the main page.
  - Assert the extension doesn't return an active profile.
  - Verify that the page does not show an active profile.

### 4. Switching profiles activates the correct profile

- **Description**: Tests if switching between profiles correctly activates the correct profile in the app.
- **Test Steps**:
  - Setup 3 profiles in the extension.
  - Switch between the profiles and verify that the correct profile is always activated on the main page.

### 5. Removing profile inside the extension deactivates the profile inside the app

- **Description**: Tests if removing a profile inside the extension deactivates the profile.
- **Test Steps**:
  - Set up a profile in the extension.
  - Assert it is active on the main page.
  - Remove the profile inside the extension.
  - Verify that the profile is deactivated on the main page.

### 6. Clicking on the "Continue as <profile>" will redirect to login screen if active profile is not authenticated

- **Description**: Tests if creating a profile adds it to the list of profiles.
- **Test Steps**:
  - Activate a profile.
  - Mock the response from the auth server to return an unauthenticated session.
  - Click on the "Continue as <profile>" button.
  - Verify that app redirects to the login screen.

### 7. Switching profiles will invalidate any active authentication session

- **Description**: Tests if switching between profiles two profiles adds both to the list.
- **Test Steps**:
  - Set up two profiles.
  - Have 1 profile have an active session.
  - Switch to the other profile.
  - Verify that the active session is invalidated.

### 8. When an active profile is authenticated, the app displays a message that the user is logged in

- **Description**: Tests if the authenticated state is correctly displayed.
- **Test Steps**:
  - Set up a profile with an active session.
  - Mock the response from the auth server to return an authenticated session.
  - Verify that the app displays a message that the user is logged in.

### 9. Log out

- **Description**: Tests if clicking the logout button invalidates the active session.
- **Test Steps**:
  - Set up a profile with an active session.
  - Click the logout button.
  - Verify the absence of an active session.
  - Verify the login form is displayed.
  - Verify that the active profile is still displayed.

### 10. Reloading the app restores the active profile

- **Description**: Tests if a hard reload of the app restores the active profile.
- **Test Steps**:
  - Set up a profile with an active session.
  - Reload the page.
  - Verify that the active profile is still displayed.

### 11. Login without extension using WebID

- **Description**: Test the login flow using a WebID input field.
- **Test Steps**:
  - Register a profile.
  - Load main page.
  - Enter the profile's WebID in the input field, just like a user would.
  - Log in using profile's credentials.
  - Verify that upon redirect to the main page, the app is authenticated.

### 12. Displays logged in profile's WebID name when available

- **Description**: Test if the WebID's name is displayed.
- **Test Steps**:
  - Register a profile.
  - Mock the WebID's response to include a name.
  - Load main page with extension.
  - Assert the extension is installed.
  - Enter the profile's WebID in the input field, just like a user would.
  - Log in using profile's credentials.
  - Verify that upon redirect to the main page displays the WebID's name.

### 13. Displays logged in profile's WebID name in the first available locale if name is given in multiple locales

- **Description**: Test if the WebID's name is displayed.
- **Test Steps**:
  - Register a profile.
  - Mock the WebID's response to include name for multiple locales.
  - Load main page with extension.
  - Assert the extension is installed.
  - Enter the profile's WebID in the input field, just like a user would.
  - Log in using profile's credentials.
  - Verify that upon redirect to the main page displays the WebID's name for the first locale.

### 14. Displays info message if the extension is not installed

- **Description**: Test if a connection can be established with the extension, showing a warning if unsuccessful.
- **Test Steps**:
  - Start the app without the extension installed.
  - Verify that the app displays a warning message.

