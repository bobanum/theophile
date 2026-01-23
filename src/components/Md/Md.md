# Md Component

> A small Webponent that parses and renders Markdown safely in the shadow DOM. Uses `marked` for parsing, `DOMPurify` to sanitize output, and `highlight.js` for code highlighting.

## Overview

`Md` converts Markdown into sanitized HTML and projects it into the component using named slots. It supports two primary content sources:

- Inline content placed between the component tags.
- Remote content loaded via the `src` attribute.

It also exposes a `style` slot so you can pass a stylesheet into the shadow DOM.

## Installation

Import and register the component (the package already registers it as `th-md`):

```javascript
import './src/components/Md/index.js';
// Then use <th-md> in your HTML
```

## Basic Usage

### Inline Markdown

~~~html
<th-md>
## Hello

This is **Markdown** rendered inside the component.

```js
console.log('code block')
```
</th-md>
~~~

### Loading from `src`

~~~html
<th-md src="/docs/readme.md"></th-md>
~~~

## Slots

- `inline-content` — receives parsed content created from inline children (rendered automatically).
- `src-content` — receives parsed content created by loading the file referenced by the `src` attribute.
- `style` — allow passing stylesheets into the component's shadow DOM.

You do not normally need to interact with these slots directly; the component appends parsed content into elements that use these slot names.

## Attributes

- `src` — URL to fetch Markdown from. When present the component fetches and renders the remote Markdown.

## Public methods

The component exposes a few useful methods on the instance:

- `loadFromSrc(url)` — fetch and render Markdown from `url` (returns a Promise).
- `parse(markdown)` — parse raw Markdown string to sanitized HTML (returns HTML string).
- `setContent(prefix, markdown)` — internal helper to set content into the appropriate slot (`'inline'` or `'src'`).

Example (programmatic):

```javascript
const m = document.createElement('th-md');
document.body.appendChild(m);
// load remote file
m.loadFromSrc('/docs/example.md');
// parse a string and set inline content (internals)
// m.setContent('inline', '# hi'); // not required for normal usage
```

## Security & highlighting

- Markdown is parsed with `marked`.
- Output is sanitized with `DOMPurify(window)` before insertion into the DOM.
- Code blocks are highlighted with `highlight.js` (GitHub style is included by default).

## Styling

Pass custom styles through the `style` slot to apply component-local CSS. Example:

~~~html
<th-md>
  <link slot="style" rel="stylesheet" href="/css/custom-md.css">
  # Hello
</th-md>
~~~

## Notes & Implementation details

- The component observes mutations to its light DOM to reactively re-render inline content.
- It uses slots named `inline-content` and `src-content` to keep sources separate and allow multiple `th-md` instances without conflicts.
- If `src` attribute changes the component will re-fetch the URL and re-render the content.

## Example

~~~html
<!-- Inline example -->
<th-md>
### Inline Title

Some **bold** text and a code block:

```js
console.log('highlighted')
```
</th-md>

<!-- Remote example -->
<th-md src="/examples/readme.md"></th-md>
~~~

---

Credits: implemented using `marked`, `DOMPurify`, and `highlight.js`.
