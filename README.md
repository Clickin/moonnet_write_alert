# TYPE-MOON Write Leave Alert

Userscript for Tampermonkey, Greasemonkey, Violentmonkey, and compatible browser extensions.

## Behavior

When a `www.typemoon.net` page contains this editor iframe, the script enables the browser's default leave-page confirmation:

```html
<iframe src="https://www.typemoon.net/plugin/editor/smarteditor2/SmartEditor2Skin.html">
```

The warning applies to normal page exits such as link navigation, form submission, refresh, tab close, back, and forward while the iframe is present. If the iframe is removed, the warning is disabled.

Modern browsers control the dialog text and may only show the warning after the user has interacted with the page.

## Install

Open `typemoon-write-alert.user.js` in your userscript manager and install it.

## Publishing

Greasy Fork is the preferred public host for this script because it has Korean UI support and handles userscript updates through its own install and update URLs.

Before publishing:

- Keep `@name`, `@name:ko`, `@description`, `@description:ko`, `@namespace`, `@version`, `@license`, and `@match` in the metadata block.
- Increase `@version` for every code change.
- Do not add external update URLs when publishing on Greasy Fork. Greasy Fork rewrites `@updateURL` and `@downloadURL` to its own URLs.
- Use the source code upload form and paste or upload `typemoon-write-alert.user.js`.
- Use `docs/greasyfork-description.ko.md` as the Korean Markdown description on Greasy Fork.

OpenUserJS is also usable. If publishing there, use its generated script URLs after upload:

```js
// @updateURL    https://openuserjs.org/meta/<username>/<scriptname>.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/<username>/<scriptname>.user.js
```

For Greasy Fork, leave those keys out of this repository's source file.

## Verify

```sh
node --test test/typemoon-write-alert.test.mjs
```
