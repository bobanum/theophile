# Menu.js

`Menu.js` is a small JavaScript utility class that generates a dynamic navigation menu from a JSON-like structure.  
It supports nested submenus, event handlers, disabled/hidden items, separators, and HTML attributes.

---

## Features

- ✅ Render menu items from a structured data object  
- ✅ Supports submenus (nested `<ul>`)  
- ✅ Disabled items (non-clickable)  
- ✅ Hidden items (excluded from DOM)  
- ✅ Separators between menu sections  
- ✅ Custom attributes (`class`, `id`, `data-*`, etc.)  
- ✅ Event bindings (`click`, `mouseover`, …)  
- ✅ External links with `target="_blank"`

---

## Data Structure

The menu is defined as an **array of objects**.  
Each object represents one `<li>` entry.  

### Item properties

| Property       | Type            | Description                                                                 |
|----------------|-----------------|-----------------------------------------------------------------------------|
| `title`        | `string\|false` | Text of the menu item. If `false`, the item is rendered as a **separator**. |
| `url`          | `string`        | Link URL. If omitted, item is rendered as `<span>` instead of `<a>`.        |
| `attributes`   | `object`        | Key-value pairs added as attributes to the `<li>` element.                  |
| `submenu`      | `array`         | Array of child items (nested submenu).                                      |
| `disabled`     | `boolean`       | If `true`, item is styled as disabled (`.disabled`).                        |
| `hidden`       | `boolean`       | If `true`, item is not rendered in the DOM.                                 |
| `target`       | `string`        | Target attribute for links (`_blank`, `_self`, etc.).                       |
| `evt`          | `object`        | Event handlers (`{ click: (e) => {...} }`). Applied to `<a>` or `<span>`.   |

---

## Example Data

```js
const menu = [
  {
    title: "Accueil",
    url: "/index.html",
    evt: {
      click: (e) => {
        e.preventDefault();
        console.log("Accueil clicked");
      }
    }
  },
  {
    title: "Cours",
    attributes: { class: "menu-cours" },
    submenu: [
      { title: "Cours 1", url: "/cours01.html" },
      { title: "Cours 2", url: "/cours02.html", disabled: true },
      { title: "Cours 3", url: "/cours03.html" }
    ]
  },
  {
    title: false // separator
  },
  {
    title: "Remise",
    url: "https://remise.cstj.qc.ca/",
    target: "_blank"
  }
];
