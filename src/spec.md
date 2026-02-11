# Specification

## Summary
**Goal:** Provide an in-app “Make it Live” help flow that explains how to publish permanently when the user can’t find the Go Live/Publish button in the external chat UI.

**Planned changes:**
- Add a dedicated in-app help page that explains where to find the Go Live/Publish button, includes step-by-step instructions, and provides at least three troubleshooting tips (e.g., scroll, try another browser, disable extensions/ad blockers, zoom out).
- Include guidance that drafts expire and that only publishing via the chat UI makes the deployment permanent.
- Add a clear fallback section for “create a new one” explaining how to rebuild a new draft and what to expect (it still expires until published).
- Add entry points to this help content from both the Landing Page (“Make this app live”) and the authenticated dashboard header area.
- Create and register a dedicated route (e.g., `/publish-help`) in the TanStack Router route tree, including a clear way to go back or return home.

**User-visible outcome:** Users can open an in-app “Make it Live” help page from both the landing page and dashboard (or directly via `/publish-help`) to troubleshoot missing Go Live/Publish controls and understand the draft-rebuild fallback.
