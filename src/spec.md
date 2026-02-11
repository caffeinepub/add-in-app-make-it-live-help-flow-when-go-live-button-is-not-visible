# Specification

## Summary
**Goal:** Remove the “Make This App Live” entry points and fully remove the /publish-help page/route from the frontend.

**Planned changes:**
- Remove the “Make This App Live” section/button from the Landing Page, including its click handler and any related imports/icons.
- Remove the “Make This App Live” menu item from the authenticated user profile dropdown, including its click handler and any related imports/icons.
- Remove the /publish-help route registration and stop shipping/compiling the PublishHelpPage, ensuring no broken imports remain.

**User-visible outcome:** Users will no longer see “Make This App Live” in the Landing Page or profile dropdown, and /publish-help will no longer exist as an in-app page.
