# End-to-End Test Documentation

This document provides an overview of the end-to-end tests written for the extension.
Each test is briefly described for easy reference.

## Test Cases

### 1. Popup page has title

- **Description**: Tests if the popup page has the correct title.
- **Test Steps**:
  - Open the popup page.
  - Check if the page title matches "Solid Identity Selector".

### 2. Popup page without profiles

- **Description**: Tests the popup page behavior when no profiles are present.
- **Test Steps**:
  - Open the popup page.
  - Verify that a message indicates no selected profile.
  - Check if the list of identities is empty.
  - Ensure the 'Add' button is visible.

### 3. Add button opens add-new-profile page

- **Description**: Tests if clicking the 'Add' button opens the add-new-profile page.
- **Test Steps**:
  - Open the popup page.
  - Click the 'Add' button.
  - Verify that the new page title includes "Add a new Solid profile".
  - Ensure the heading "Add new profile" is visible.

### 4. Add new profile page has all necessary input fields

- **Description**: Tests if all necessary input fields are present on the add new profile page.
- **Test Steps**:
  - Open the new profile page.
  - Verify visibility, editability, and emptiness of display name, idp, and webid textboxes.
  - Check placeholders for these textboxes.

### 5. Mutual exclusivity of IDP and WebID fields

- **Description**: Tests if the IDP and WebID fields are mutually exclusive.
- **Test Steps**:
  - Open the new profile page.
  - Fill in the IDP field and verify that the WebID field is disabled, and vice versa.

### 6. Create profile validates empty fields

- **Description**: Tests validation for empty fields when creating a profile.
- **Test Steps**:
  - Navigate to the identity creation page.
  - Attempt to create a profile without filling in any fields.
  - Verify that error messages and classes are applied correctly.

### 7. Creating a profile adds it to list of profiles

- **Description**: Tests if creating a profile adds it to the list of profiles.
- **Test Steps**:
  - Create a profile.
  - Verify that the profile appears in the list of identities.

### 8. Creating 2 profiles adds both to list of profiles

- **Description**: Tests if creating two profiles adds both to the list.
- **Test Steps**:
  - Create two profiles.
  - Verify both profiles appear in the list.

### 9. Profile header shows name and avatar of active profile

- **Description**: Tests if the profile header updates correctly.
- **Test Steps**:
  - Create profiles and verify that the header shows the correct name and avatar.

### 10. Switching profile activates correct one

- **Description**: Tests if switching profiles activates the correct one.
- **Test Steps**:
  - Create multiple profiles.
  - Switch between them and verify the correct activation.

### 11. Clicking the settings button next to a profile opens the edit profile dialog

- **Description**: Tests if a profile is correctly displayed in the update profile dialog.
- **Test Steps**:
  - Create a profile.
  - Click the settings button next to the profile.
  - Verify that the profile is correctly displayed in the update profile dialog.

### 12. Clicking delete profile button shows confirmation dialog

- **Description**: Tests if clicking the delete button shows a confirmation dialog.
- **Test Steps**:
  - Create a profile and attempt to delete it.
  - Verify the appearance of the confirmation dialog.

### 13. Dismissing confirmation dialog for deletion

- **Description**: Tests if dismissing the confirmation dialog prevents profile deletion.
- **Test Steps**:
  - Dismiss the deletion confirmation dialog.
  - Verify that the profile still exists.

### 14. Confirming profile deletion removes the profile

- **Description**: Tests if confirming deletion removes the profile.
- **Test Steps**:
  - Confirm profile deletion and verify its removal from all relevant pages.

### 15. Editing profile changes its attributes

- **Description**: Tests if editing a profile updates its attributes.
- **Test Steps**:
  - Edit a profile's attributes and verify updates on both settings and main page.

### 16. Profile colors can be changed

- **Description**: Tests if profile colors can be changed.
- **Test Steps**:
  - Change a profile's color and verify the update across different elements.

### 17. When editing a profile, IDP and WebID fields are mutually exclusive

- **Description**: Tests mutual exclusivity of IDP and WebID fields during profile editing.
- **Test Steps**:
  - Edit a profile and verify the mutual exclusivity of IDP and WebID fields.

### 18. Edits of IDP are persisted

- **Description**: Tests if changes to the IDP field are saved.
- **Test Steps**:
  - Edit the IDP field of a profile and verify persistence of the change.

### 19. Edits of WebID are persisted

- **Description**: Tests if changes to the WebID field are saved.
- **Test Steps**:
  - Edit the WebID field of a profile and verify persistence of the change.
