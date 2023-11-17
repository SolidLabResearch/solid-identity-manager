# End-to-End Test Documentation

This document provides an overview of the end-to-end tests written for the extension.
Each test is briefly described for easy reference.

## Test Cases

### 1. Popup Page Has Title

- **Description**: Tests if the popup page has the correct title.
- **Test Steps**:
  - Open the popup page.
  - Check if the page title matches "Solid Identity Selector".

### 2. Popup Page Without Profiles

- **Description**: Tests the popup page behavior when no profiles are present.
- **Test Steps**:
  - Open the popup page.
  - Verify that a message indicates no selected profile.
  - Check if the list of identities is empty.
  - Ensure the 'Add' button is visible.

### 3. Add Button Opens Add-New-Profile Page

- **Description**: Tests if clicking the 'Add' button opens the add-new-profile page.
- **Test Steps**:
  - Open the popup page.
  - Click the 'Add' button.
  - Verify that the new page title includes "Add a new SOLID profile".
  - Ensure the heading "Add new profile" is visible.

### 4. Add New Profile Page Has All Necessary Input Fields

- **Description**: Tests if all necessary input fields are present on the add new profile page.
- **Test Steps**:
  - Open the new profile page.
  - Verify visibility, editability, and emptiness of display name, idp, and webid textboxes.
  - Check placeholders for these textboxes.

### 5. Mutual Exclusivity of IDP and WebID Fields

- **Description**: Tests if the IDP and WebID fields are mutually exclusive.
- **Test Steps**:
  - Open the new profile page.
  - Fill in the IDP field and verify that the WebID field is disabled, and vice versa.

### 6. Create Profile Validates Empty Fields

- **Description**: Tests validation for empty fields when creating a profile.
- **Test Steps**:
  - Navigate to the identity creation page.
  - Attempt to create a profile without filling in any fields.
  - Verify that error messages and classes are applied correctly.

### 7. Creating a Profile Adds It to List of Profiles

- **Description**: Tests if creating a profile adds it to the list of profiles.
- **Test Steps**:
  - Create a profile.
  - Verify that the profile appears in the list of identities.

### 8. Creating 2 Profiles Adds Both to List of Profiles

- **Description**: Tests if creating two profiles adds both to the list.
- **Test Steps**:
  - Create two profiles.
  - Verify both profiles appear in the list.

### 9. Profile Header Shows Name and Avatar of Active Profile

- **Description**: Tests if the profile header updates correctly.
- **Test Steps**:
  - Create profiles and verify that the header shows the correct name and avatar.

### 10. Switching Profile Activates Correct One

- **Description**: Tests if switching profiles activates the correct one.
- **Test Steps**:
  - Create multiple profiles.
  - Switch between them and verify the correct activation.

### 11. Manage Profiles Popup Display Empty List If No Profiles Exist

- **Description**: Tests if the manage profiles popup correctly displays an empty list when no profiles exist.
- **Test Steps**:
  - Open the settings page and verify the absence of profiles.

### 12. Manage Profiles Popup Displays All Profiles

- **Description**: Tests if all profiles are displayed in the manage profiles popup.
- **Test Steps**:
  - Create profiles and verify their presence in the settings page.

### 13. Clicking Delete Profile Button Shows Confirmation Dialog

- **Description**: Tests if clicking the delete button shows a confirmation dialog.
- **Test Steps**:
  - Create a profile and attempt to delete it.
  - Verify the appearance of the confirmation dialog.

### 14. Dismissing Confirmation Dialog For Deletion

- **Description**: Tests if dismissing the confirmation dialog prevents profile deletion.
- **Test Steps**:
  - Dismiss the deletion confirmation dialog.
  - Verify that the profile still exists.

### 15. Confirming Profile Deletion Removes the Profile

- **Description**: Tests if confirming deletion removes the profile.
- **Test Steps**:
  - Confirm profile deletion and verify its removal from all relevant pages.

### 16. Editing Profile Changes Its Attributes

- **Description**: Tests if editing a profile updates its attributes.
- **Test Steps**:
  - Edit a profile's attributes and verify updates on both settings and main page.

### 17. Profile Colors Can Be Changed

- **Description**: Tests if profile colors can be changed.
- **Test Steps**:
  - Change a profile's color and verify the update across different elements.

### 18. When Editing a Profile, IDP and WebID Fields Are Mutually Exclusive

- **Description**: Tests mutual exclusivity of IDP and WebID fields during profile editing.
- **Test Steps**:
  - Edit a profile and verify the mutual exclusivity of IDP and WebID fields.

### 19. Edits of IDP Are Persisted

- **Description**: Tests if changes to the IDP field are saved.
- **Test Steps**:
  - Edit the IDP field of a profile and verify persistence of the change.

### 20. Edits of WebID Are Persisted

- **Description**: Tests if changes to the WebID field are saved.
- **Test Steps**:
  - Edit the WebID field of a profile and verify persistence of the change.
