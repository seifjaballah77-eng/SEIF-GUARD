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
- Instantly hide all selected protected pages with the dedicated popup button.
- Emergency quick-unlock phrase: type exactly ten lowercase `s` characters (`ssssssssss`) into the PIN field. This phrase is fixed in this build.
- Choose which built-in websites are protected with per-site switches.
- Add custom HTTPS website domains in Chrome/Edge; the browser asks permission for each domain.
- Remove a website from the protected list at any time.
- Unlock an individual page for the current page session.
- Keyboard shortcut: **Alt+Shift+L** to activate the privacy lock.
- Dark purple/neon SEIF-GUARD interface.
- No account or remote server required.

## Download packaged builds
A GitHub Actions workflow packages separate Chromium and Firefox ZIP files when browser-extension files change. Open the repository's **Actions** tab, select **Build SEIF-GUARD browser extensions**, and download the artifact from a successful run.

## Install in Chrome, Edge, or compatible Chromium browsers
1. Download or clone this repository.
2. Open the browser's extensions page.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the browser-extension folder.
5. Open a supported website, open the extension, and create your PIN.
6. In Chrome/Edge, use **Add a website** to protect another HTTPS domain; grant the requested site permission when the browser asks.

For Edge, open `edge://extensions`. For Chrome, open `chrome://extensions`.

## Firefox
The built-in WhatsApp, Telegram, Messenger, and Instagram sites are supported. Adding arbitrary custom domains is currently available in Chromium-based browsers only. Firefox's manifest and background handling differ from Chromium's.

## Important security limits
A custom entry protects the whole website domain (including its subdomains), not just one URL path. The extension does not encrypt website data; it places a PIN screen over selected pages.

The quick-unlock phrase is a deliberate convenience bypass, not strong authentication. It is embedded in the extension's client-side code, so someone who can inspect the extension files can discover it. Anyone who knows the phrase can bypass the PIN screen. Do not use this build as a high-security vault.

This is a **local browser privacy screen**, not a replacement for an operating-system account password or the messaging services' own security. A person who can control the same unlocked browser profile, open developer tools, remove the extension, or access the computer as its owner may bypass it. The extension does not encrypt the messaging service's own local database, prevent screenshots, or lock native desktop/mobile apps. Keep the computer account protected.
