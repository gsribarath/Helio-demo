Video Call Page Redesign

What changed
- Reworked `src/pages/VideoCallPage.js` to provide a modern, professional demo UI while preserving the existing call workflow (routing and handlers unchanged).
- Added `src/pages/VideoCallPage.css` with responsive, mobile-friendly styles, modern rounded controls, soft shadows, and consistent colors.

How to test
1. Start the frontend (from project root):

   npm --prefix "./frontend" start

2. Navigate the app to trigger a video call (the app already routes `/video-call` to `VideoCallPage`). Ensure that the navigation that previously opened the call (for example from a doctor's profile or "Start Video" action) still redirects into the page correctly.

3. Verify UI elements:
   - Dummy video area shows doctor initials, name and "Video Call Active" badge.
   - Patient mini view shows "You" and camera state.
   - Call controls (mute, camera, end call, speaker, share) are visible and interactive (they toggle local UI state).
   - Chat panel toggle works and shows a placeholder.

Notes
- No backend or call media logic was changed. This is a presentational redesign for demo purposes only.
- Build done locally showed unrelated eslint warnings in other pages; no new errors introduced by these changes.

If you'd like, I can further tweak spacing, colors, or create a small animation for the call starting/ending.