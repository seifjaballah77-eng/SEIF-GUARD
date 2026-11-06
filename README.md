# SEIF-GUARD

SEIF-GUARD is an Android privacy app built with Kotlin and Jetpack Compose.

## Platform target and compatibility

- Initial minimum Android version: Android 6.0 (API 23).
- Keep core privacy features usable without requiring a fingerprint sensor or newer hardware.
- Use AndroidX Biometric for compatible biometric authentication from API 23; fall back to the app PIN when biometrics are unavailable or not enrolled.
- Use Android Keystore for cryptographic key protection. Hardware-backed protection and StrongBox are optional device capabilities, not guaranteed on every phone.
- Use the Storage Access Framework (SAF) and user-selected files for broad storage compatibility. Adapt media permissions and storage handling to each Android version.
- Android 10 (API 29) and Android 11+ (API 30+) impose progressively stricter scoped-storage rules. Do not depend on unrestricted access to all files.
- Lock-screen notification visibility controls are available from API 21, but SEIF-GUARD can control only notifications it posts. It cannot globally hide notifications from other apps.
- Test on Android 6, 8/9, 10, 11, 13, and current Android versions, plus different manufacturers where possible.

## Development roadmap (priority order)

### Phase 0 — Foundation and compatibility
- Native Android project and launcher identity picker.
- Calendar, Clock, and Files launcher identities, with three icon variants each.
- Preserve a clear, honest app identity and explain that these are SEIF-GUARD modes, not the original system apps.
- Establish a version-aware compatibility layer and a device test matrix.

### Phase 1 — Security core (highest priority)
- App PIN/passcode setup, change, and recovery flow.
- Optional fingerprint/biometric unlock through AndroidX Biometric.
- PIN fallback whenever biometric hardware is missing, unavailable, or not enrolled.
- Encrypt vault data and notes using modern authenticated encryption; protect key material with Android Keystore where supported.
- Auto-lock on app background, screen-off, and configurable inactivity timeout.
- Never store the PIN or passwords as plain text.

### Phase 2 — Encrypted media and file vault
- Import photos, videos, and documents using Android's system file/photo pickers.
- Encrypt files before storing them in the private app vault.
- Browse, preview, rename, export, and permanently delete vault items after authentication.
- Handle large files as streams/chunks instead of loading whole files into memory.
- Keep originals unchanged unless the user explicitly chooses to delete them.
- Use SAF and version-specific media access; do not request broad “all files” access unless a clearly justified feature truly needs it.

### Phase 3 — Failed-attempt protection
- Record failed vault unlock attempts with timestamp and count.
- Add configurable increasing delays after repeated failures.
- Show a local security log after successful authentication.
- Do not silently take photos, record audio, or send data elsewhere.

### Phase 4 — Encrypted notes and password locker
- Create, edit, search, and organize private notes.
- Store saved credentials encrypted, with copy/reveal actions protected by re-authentication.
- Auto-clear copied passwords from the clipboard after a short configurable period where supported.
- Never sync or export secrets without explicit user action.

### Phase 5 — Emergency quick lock
- Provide a quick-lock action from inside the app and a persistent optional shortcut.
- Immediately close the vault, clear sensitive screens from view, and require authentication again.
- Describe this accurately as locking SEIF-GUARD, not remotely locking the whole phone or hiding other apps.

### Phase 6 — Separate guest profile
- Add an in-app Guest space with its own encrypted storage and separate key.
- Keep guest files, notes, and settings isolated from the owner's private space.
- Allow the owner to clear guest data when leaving guest mode.
- Do not present this as a separate Android OS user account; availability of system-level multi-user features varies by device.

### Phase 7 — Encrypted backup and restore
- Export an encrypted backup chosen by the user through the system file picker.
- Protect the backup with a separate user-created passphrase or a carefully designed recovery key.
- Verify backup integrity before restore and warn before replacing existing vault data.
- Explain that losing the backup passphrase may make the backup unrecoverable.
- Keep backups opt-in; do not upload private data automatically.

### Phase 8 — Real Calendar, Clock, and Files modes
- Calendar mode: a useful private calendar/planner screen, not merely a changed icon or label.
- Clock mode: real clock, alarms, and timers using supported Android APIs.
- Files mode: a real file browser and encrypted-vault entry point with user-granted access.
- The selected launcher identity controls the app's displayed launcher name and icon, while every mode remains clearly part of SEIF-GUARD.

### Phase 9 — Notification privacy
- Offer a setting to redact or hide sensitive content in notifications posted by SEIF-GUARD.
- Use Android lock-screen visibility levels where supported (API 21+).
- Provide instructions to Android Settings for users who want to hide lock-screen content from other apps; do not claim SEIF-GUARD can change those apps' notification settings globally.

## Security and platform limits

- A normal Android app cannot freely hide itself or other installed apps from Android Settings, app-management screens, or Google Play.
- Launcher aliases change only the app's launcher entry; they do not make SEIF-GUARD a genuine system Calendar, Clock, or Files app.
- Biometric availability and strength depend on the device and Android version. Always provide a secure PIN fallback.
- Hardware-backed Keystore/StrongBox support varies by device. Detect capabilities and use a safe supported fallback.
- Android 10+ scoped storage means file access must be permission-aware and based on user selection where possible.
- In-app Guest mode is separate app data, not a guaranteed separate Android user.

## Build

Open this repository in a recent Android Studio version, allow Gradle sync, then run the `app` configuration on an Android device or emulator.

The GitHub Actions workflow is intended to build an APK artifact. A successful workflow build and real-device testing are still required before claiming the app is ready.

## Status

Initial project foundation and launcher identity picker are in place. The roadmap above is planned work; the security features and APK have not yet been fully implemented or device-tested.
