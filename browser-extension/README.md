# SEIF-GUARD Browser Extension

A first browser-extension build for the SEIF-GUARD privacy project. It places a full-page PIN screen over selected messaging websites when the local privacy lock is enabled.

## Included websites
- WhatsApp Web — https://web.whatsapp.com
- Telegram Web — https://web.telegram.org and its subdomains
- Messenger — https://messenger.com
- Instagram — https://www.instagram.com

## Features in this build
- Create a local PIN (minimum 6 characters).
- Derive a PIN verifier with PBKDF2-HMAC-SHA-256 and a random salt.
- Lock and unlock protected pages from the extension popup.
- Choose which built-in websites are protected with per-site switches.
- Add custom HTTPS website domains in Chrome/Edge; the browser asks permission for each domain, and only granted domains are eligible for the lock screen.
- Remove a website from the protected list at any time.
- Unlock an individual page for the current page session.
- Keyboard shortcut: **Alt+Shift+L** (may be changed in extension-shortcuts settings).
- Dark purple/neon SEIF-GUARD interface.
- No account or remote server required.

## Download packaged builds\n\nA GitHub Actions workflow packages separate Chromium and Firefox ZIP files when browser-extension files change. Open the repository's **Actions** tab, select **Build SEIF-GUARD browser extensions**, and download the `SEIF-GUARD-browser-extensions` artifact from a successful run.\n\n## Install in Chrome, Edge, or compatible Chromium browsers
1. Download or clone this repository.
2. Open the browser's extensions page.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the browser-extension folder.
5. Open a supported website, open the extension, and create your PIN. Instagram is included. In Chrome/Edge, use **Add a website** to protect another HTTPS domain; grant the requested site permission when the browser asks.

For Edge, open edge://extensions. For Chrome, open chrome://extensions.

## Firefox
The built-in WhatsApp, Telegram, Messenger, and Instagram sites are supported. Adding arbitrary custom domains is currently available in Chromium-based browsers only.
Use Firefox's temporary-add-on or packaged-extension flow with manifest.firefox.json as the manifest. For a permanent install, the extension must be packaged and signed through Mozilla Add-ons. Firefox's manifest and background handling differ from Chromium's.

## Supermium
Supermium compatibility is not confirmed yet. It depends on the specific Supermium release and its extension API/manifest support. Try the Chromium manifest first; if that release does not support Manifest V3, a separately tested legacy build will be needed.

## Important security limits
A custom entry protects the whole website domain (including its subdomains), not just one URL path. The extension does not encrypt the website's data; it places a PIN screen over selected pages.

This is a **local browser privacy screen**, not a replacement for an operating-system account password or the messaging services' own security. A person who can control the same unlocked browser profile, open developer tools, remove the extension, or access the computer as its owner may bypass it. The extension does not encrypt the messaging service's own local database, prevent screenshots, or lock native desktop/mobile apps. Keep the computer account protected and do not treat this first build as high-assurance vault storage.

The page overlay can briefly appear after the website begins loading. Browser extensions cannot guarantee that a page's own notifications, browser-level previews, or data are hidden before every script runs.