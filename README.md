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
- Camera and microphone access must be permission-based, transparent, and subject to Android background-use restrictions.
- Test on Android 6, 8/9, 10, 11, 13, and current Android versions, plus different manufacturers where possible.

## Development roadmap (priority order)

### Phase 0 — Foundation, first-run guidance, and compatibility
- Native Android project and launcher identity picker.
- Calendar, Clock, and Files launcher identities, with three icon variants each.
- Preserve a clear, honest app identity and explain that these are SEIF-GUARD modes, not the original system apps.
- Establish a version-aware compatibility layer and a device test matrix.
- Keep the primary entry actions (Owner and Guest) in a consistent, prominent, easy-to-reach position on the opening screen and across the app's entry points.
- On the first launch, show a short, skippable walkthrough explaining Owner vs Guest, where the main entry buttons are, how to open the vault, and where Help is located.
- Show contextual tips the first time the user visits each major area or mode (Vault, Notes, Passwords, Calendar, Clock, Files, Backup, Guest). Mark each tip as seen so it does not repeatedly interrupt the user.
- Add a persistent, clearly visible Help icon or menu item so guidance is never inaccessible.
- Add a recovery gesture: tapping the SEIF-GUARD logo at the top of the main screen five times in a short sequence reopens the walkthrough/help guide. The gesture is an extra shortcut, not the only way to find Help.
- Include a “Show guide again” action in Settings and allow users to reset the tips if they want to learn the app again.
- Save onboarding/tip completion locally and avoid collecting analytics or sending usage data just to track whether a tip was shown.

### Phase 1 — Security core (highest priority)
- App PIN/passcode setup, change, and recovery flow.
- Optional fingerprint/biometric unlock through AndroidX Biometric.
- PIN fallback whenever biometric hardware is missing, unavailable, or not enrolled.
- Encrypt vault data and notes using modern authenticated encryption; protect key material with Android Keystore where supported.
- Auto-lock on app background, screen-off, and configurable inactivity timeout.
- Never store the PIN or passwords as plain text.

### Phase 2 — Guest-first entry and isolated guest space
- Make the opening screen clearly offer two separate paths: **Owner** and **Guest**.
- Owner entry always requires the owner's PIN or supported biometric; guest mode must never reveal whether the owner PIN is correct.
- Guest gets a separate space with its own database, encryption key, files, notes, and settings.
- Guest cannot browse, search, export, or infer the existence/content of owner vault items.
- The owner chooses whether guest data is temporary (clear on exit) or retained until manually cleared.
- Add a clear “Exit guest” action that returns to the entry screen and clears sensitive guest screens from memory.
- Switching from Guest to Owner requires returning to the entry screen and authenticating as Owner.
- Do not present this as a separate Android OS user account; it is an isolated in-app profile.

### Phase 3 — Failed-attempt protection and security events
- Record failed unlock attempts with timestamp, attempt count, and the entry method involved (PIN or biometric result where the OS provides it).
- Add configurable increasing delays after repeated failures; never permanently lock the legitimate owner out.
- Show a local incident log after the owner successfully authenticates.
- Offer optional alerts to the owner after a configurable number of failed attempts, without exposing private content on the lock screen.
- Optional camera evidence must not be covert: only consider a user-enabled, clearly disclosed capture flow with runtime permission, visible indication, and compliance with Android camera/background restrictions. Never secretly photograph someone or bypass camera indicators/permissions.
- Microphone/audio recording is not part of automatic failed-attempt detection. Any future audio note or recording must be started deliberately by the user, with microphone permission and a clear recording indicator; obtain consent from people being recorded and follow local law.
- Do not silently upload, transmit, or share incident evidence.

### Phase 4 — Encrypted media and file vault
- Import photos, videos, and documents using Android's system file/photo pickers.
- Encrypt files before storing them in the private app vault.
- Browse, preview, rename, export, and permanently delete vault items after authentication.
- Handle large files as streams/chunks instead of loading whole files into memory.
- Keep originals unchanged unless the user explicitly chooses to delete them.
- Use SAF and version-specific media access; do not request broad “all files” access unless a clearly justified feature truly needs it.

### Phase 5 — Encrypted notes and password locker
- Create, edit, search, and organize private notes.
- Store saved credentials encrypted, with copy/reveal actions protected by re-authentication.
- Auto-clear copied passwords from the clipboard after a short configurable period where supported.
- Never sync or export secrets without explicit user action.

### Phase 6 — Emergency quick lock
- Provide a quick-lock action from inside the app and a persistent optional shortcut.
- Immediately close the vault, clear sensitive screens from view, and require authentication again.
- Describe this accurately as locking SEIF-GUARD, not remotely locking the whole phone or hiding other apps.

### Phase 7 — Encrypted backup and restore
- Export an encrypted backup chosen by the user through the system file picker.
- Protect the backup with a separate user-created passphrase or a carefully designed recovery key.
- Let the owner choose whether guest data is included; exclude it by default.
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

## Additional security ideas (later, after core testing)

- Panic shortcut that instantly locks the app and returns to the neutral entry screen.
- Decoy guest workspace with sample content, clearly separated from the real owner vault and never used to claim that data is deleted when it is not.
- Optional owner alert when a failed-attempt threshold is reached.
- Session history showing when Owner and Guest spaces were opened and closed.
- Automatic lock when the device screen turns off or the app loses focus.
- Backup integrity check and a recovery test reminder.

## Security and platform limits

- A normal Android app cannot freely hide itself or other installed apps from Android Settings, app-management screens, or Google Play.
- Launcher aliases change only the app's launcher entry; they do not make SEIF-GUARD a genuine system Calendar, Clock, or Files app.
- Biometric availability and strength depend on the device and Android version. Always provide a secure PIN fallback.
- Hardware-backed Keystore/StrongBox support varies by device. Detect capabilities and use a safe supported fallback.
- Android 10+ scoped storage means file access must be permission-aware and based on user selection where possible.
- In-app Guest mode is separate app data, not a guaranteed separate Android user.
- Android restricts background camera and microphone access. SEIF-GUARD must not attempt covert recording or bypass permissions, indicators, or consent.

## Build

Open this repository in a recent Android Studio version, allow Gradle sync, then run the `app` configuration on an Android device or emulator.

The GitHub Actions workflow is intended to build an APK artifact. A successful workflow build and real-device testing are still required before claiming the app is ready.

## Status

Initial project foundation and launcher identity picker are in place. The roadmap above is planned work; the security features and APK have not yet been fully implemented or device-tested.
