# SEIF-GUARD Browser Extension

A browser extension that places a full-page PIN screen over selected websites when the local privacy lock is enabled.

## Included websites
- WhatsApp Web — https://web.whatsapp.com
- Telegram Web — https://web.telegram.org and its subdomains
- Messenger — https://messenger.com
- Instagram — https://www.instagram.com

## Features in this build
- Create a local PIN (minimum 6 characters).
- Derive a PIN verifier with PBKDF2-HMAC-SHA-256 and a random salt.
- Lock and unlock protected pages from the extension popup.
- Instantly hide all selected protected pages with the popup button.
- Panic-hide the current protected page with **Alt+Shift+H**.
- Lock all protected websites with **Alt+Shift+L**.
- Optional automatic lock after 1, 5, 10, or 30 minutes of browser/device inactivity; it can also be turned off.
- Choose which built-in websites are protected with per-site switches.
- Add custom HTTPS website domains in Chrome/Edge; the browser asks permission for each domain.
- Remove a website from the protected list at any time.
- Unlock an individual page for the current page session.
- Emergency quick-unlock phrase: type exactly ten lowercase `s` characters (`ssssssssss`) into the PIN field. This phrase is fixed in this build.
- Dark purple/neon SEIF-GUARD interface.
- No account or remote server required.

## Automatic lock behavior
The inactivity timer uses the browser's idle-state API. When enabled, the browser locks all protected websites after the selected idle period. The feature requires the browser to support the `idle` extension API.

## Download packaged builds
A GitHub Actions workflow packages separate Chromium and Firefox ZIP files when browser-extension files change. Open the repository's **Actions** tab, select **Build SEIF-GUARD browser extensions**, and download the artifact from a successful run.

## Install in Chrome, Edge, or compatible Chromium browsers
1. Download or clone this repository.
2. Open the browser's extensions page.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the browser-extension folder.
5. Open a supported website, open the extension, and create your PIN.
6. In Chrome/Edge, use **Add a website** to protect another HTTPS domain; grant the requested site permission when the browser asks.
7. Open the extension popup to choose the automatic-lock delay.

For Edge, open `edge://extensions`. For Chrome, open `chrome://extensions`.

## Firefox
The built-in WhatsApp, Telegram, Messenger, and Instagram sites are supported. Adding arbitrary custom domains is currently available in Chromium-based browsers only. Firefox's manifest and background handling differ from Chromium's; verify the packaged Firefox build before relying on the new shortcut and idle features.

## Important security limits
A custom entry protects the whole website domain (including its subdomains), not just one URL path. The extension does not encrypt website data; it places a PIN screen over selected pages.

The quick-unlock phrase is a deliberate convenience bypass, not strong authentication. It is embedded in the extension's client-side code, so someone who can inspect the extension files can discover it. Anyone who knows the phrase can bypass the PIN screen. Do not use this build as a high-security vault.

The panic-hide shortcut covers only the current protected tab until that tab is reloaded; use the lock-all shortcut to lock all selected sites persistently. A person who can control the same unlocked browser profile, open developer tools, remove the extension, or access the computer as its owner may bypass it. The extension does not encrypt the messaging service's own local database, prevent screenshots, or lock native desktop/mobile apps. Keep the computer account protected.

## Anti-phishing protection (Chrome / Chromium)

Version 0.4.0 adds a link-checking layer on ordinary HTTP(S) pages:

- Checks clicked links before navigating.
- Shows a warning screen when local URL heuristics find suspicious indicators.
- Optionally checks clicked URLs against Google Safe Browsing (malware, social engineering/phishing, and unwanted software lists).
- If the reputation service cannot be reached, it does not label the URL safe; it asks whether to return or continue.
- Only the clicked destination URL is submitted for a Google lookup when an API key is configured.

### Enable Google Safe Browsing

1. Create/select a Google Cloud project and enable the Safe Browsing API.
2. Create an API key according to Google's documentation.
3. Open the SEIF-GUARD extension popup.
4. Paste the key into **Google Safe Browsing API key** and save it.

The key is stored in this browser profile using extension local storage. Restrict the key to the Safe Browsing API in Google Cloud where supported. Do not reuse a privileged server key or a key that grants access to unrelated services.

Official API documentation: https://developers.google.com/safe-browsing/reference/rest/v4/threatMatches/find

### Permission and privacy notes

- Anti-phishing link inspection runs on all ordinary web pages. Chrome therefore requests broad site access. Restricting extension site access in Chrome settings also restricts coverage.
- The full clicked URL is sent to Google only when an API key is configured and the reputation lookup runs.
- Local heuristics can produce false positives and can miss new phishing sites. A clean Safe Browsing result is not a guarantee that a site is trustworthy.
- Keep Chrome Safe Browsing enabled. This extension is an additional layer, not a replacement.
- It does not intercept every navigation path (for example, manually typed addresses or every script-driven redirect); do not treat it as complete browser-wide protection.
- Google's API usage terms and eligibility apply. Review current terms before commercial distribution.


## PIN brute-force delay

- Failed PIN checks are counted across protected-page unlock screens and the extension popup.
- After 15 consecutive incorrect PIN attempts, PIN verification is blocked for 2 minutes.
- A visible mm:ss countdown is shown while the lockout is active.
- The lockout expiry timestamp and failed-attempt count are stored in extension local storage, so closing the popup or restarting the browser does not reset an active delay.
- A correct PIN resets the consecutive-failure counter. Incorrect attempts during an active delay are not processed.
- This is a rate-limit deterrent, not a guarantee against someone who can modify extension storage or source code. The existing emergency quick-unlock phrase remains a separate convenience bypass and is not strong authentication.
