# ChangeUrl User Guide
## Overview
ChangeUrl is a browser extension that allows users to create custom buttons for modifying and redirecting URLs. It enables quick transformations of the current tab’s URL by applying string replacements, adding query parameters, and choosing whether to redirect or open in a new tab. The extension supports both English and French languages, with a language selection option in the settings.

## Features
Custom Buttons: Create buttons to transform URLs with specific patterns or parameters.
Replacements: Replace parts of the URL using plain text or regular expressions.
Query Parameters: Add key-value pairs to the URL.
Action Types: Choose to redirect the current tab or open a new one.
Import/Export: Save and load button configurations as JSON.
Debug Logging: Enable conditional logs for troubleshooting.
Language Support: Switch between English and French in settings.
### How It Works
Access the Extension: Open the ChangeUrl popup via the browser’s extension menu.
Set Language: Go to Settings and select 'English' or 'French' from the language dropdown. The interface updates instantly to the chosen language.
Add a Button: Click 'Add a Button' to open the form. Enter a button name. Add replacements (e.g., change 'example.com' to 'test.com'). Add query parameters (e.g., key=value). Select action type: 'Redirect' (current tab) or 'Open in new tab'. Submit to save.
Run a Button: Click a button in the list to apply its transformations to the current tab’s URL.
Edit/Delete: Modify or remove buttons as needed.
Import/Export: Save your configuration or load a new one via JSON files.
Settings: Toggle debug logging and select language.
### Examples
Example 1: Simple Domain Swap
Goal: Change 'example.com' to 'test.com' in the current tab.

Setup: Name: 'Swap to Test', Replacement: Pattern = 'example.com', Value = 'test.com', Regex = false, Action Type: Redirect

Result: If the current URL is 'https://example.com/page', clicking the button redirects to 'https://test.com/page'.

Example 2: Add Query Parameters
Goal: Add '?lang=en' to any URL and open in a new tab.

Setup: Name: 'Add English Lang', Parameter: Key = 'lang', Value = 'en', Action Type: Open in new tab

Result: For 'https://site.com', clicking the button opens 'https://site.com?lang=en' in a new tab.

Example 3: Regex Replacement
Goal: Remove any subdomain (e.g., 'sub.example.com' → 'example.com').

Setup: Name: 'Remove Subdomain', Replacement: Pattern = '^https?://[^/]+\.', Value = 'https://', Regex = true, Action Type: Redirect

Result: 'https://sub.example.com/page' becomes 'https://example.com/page'.

### Tips
Use the URL preview in the form to see transformations before saving.
Enable debug logging in settings to troubleshoot issues.
Export your buttons regularly to back up your configuration.
Test regex patterns carefully to avoid errors.
Switch languages in settings to match your preference.
Support
For issues or feature requests, check the extension’s documentation or contact the developer via the support channel.

