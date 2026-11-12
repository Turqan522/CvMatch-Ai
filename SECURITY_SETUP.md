# Firebase security deployment checklist
The proposed `firestore.rules` in this repository is **not automatically deployed** by GitHub Pages. Do not assume it is active.
1. Open Firebase Console > Firestore Database > Rules; compare the current rules with the proposed file.
2. Test account isolation using Firebase Emulator and the Rules Playground: A cannot read/write B's `users/{uid}`.
3. Test valid sign-up, profile changes, saved applications, CV draft and CV version operations with old accounts.
4. Verify no unexpectedly used fields exist before activating the restrictive allowed-keys policy.
5. Publish rules via Firebase Console only after manual approval. Confirm the change takes effect.
6. Under Authentication > Settings, confirm authorized domains. Consider verified email and password-reset flows.
7. Under App Check, verify site keys and enforcement, and verify usage limits in Firebase AI Logic.
8. Set up a data deletion/privacy policy and user-controlled export. Never commit service-account keys.

Note: Firebase web API config keys are public identifiers, not server secrets. Their publication is normal; Firestore Rules/App Check and API restrictions provide access protection. The optional Node auth API in `server/` is for local use and does not power the static GitHub Pages login.
