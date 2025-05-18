# Menu Component
The Menu component is a custom HTML element that allows you to create a hierarchical menu structure. It consists of two main elements: `<th-menu>` and `<th-menu-item>`. The `<th-menu>` element represents the menu itself, while the `<th-menu-item>` element represents individual items within the menu.
> ⌚︎ = Not implemented yet.

## `<th-menu>`
The `<th-menu>` element is used to create a menu. It can contain multiple `<th-menu-item>` elements, which represent the individual items in the menu.

### Attributes
| Attribute      | Type     | Default      | Description                                                                                                                                                         | Example                              |
| -------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src`⌚︎         | `string` | `undefined`  | The URL of the menu. This can be used to load the menu from an external source. If the `src` attribute is provided, the menu will be loaded from the specified URL. | `src="menu.js"`<br>`src="menu.json"` |
| `style`⌚︎       | `string` | `undefined`  | The CSS style to apply to the menu. This can be used to customize the appearance of the menu.                                                                       | `style="color: red;"`                |
| `orientation`⌚︎ | `string` | `horizontal` | The orientation of the menu. It can be either `horizontal` or `vertical`.                                                                                           | `orientation="vertical"`             |

## `<th-menu-item>`
The `<th-menu-item>` element is used to create an individual item in the menu. It can contain a label, an icon, and a nested `<th-menu>` element to create submenus.

### Attributes

| Attribute   | Type      | Default     | Description                                                                                                                                                                                            | Example                                     |
| ----------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `label`     | `string`  | `undefined` | The label of the menu item. It is displayed as the text of the menu item.                                                                                                                              | `label="aaa"`                               |
| `icon`      | `string`  | `undefined` | The icon of the menu item. It is displayed as an icon next to the label. If the icon is an url, it will be displayed as an image. Else, it will be displayed as a font icon.                           | `icon="img/favicon.ico"`<br>`icon="person"` |
| `href`      | `string`  | `undefined` | The URL to navigate to when the menu item is clicked. If the `href` attribute is not provided, the menu item will not be clickable.                                                                    | `href="aaa.html"`                           |
| `target`⌚︎   | `string`  | `_self`     | The target window or tab to open the URL in. It can be `_self`, `_blank`, `_parent`, or `_top`.                                                                                                        | `target="_blank"`                           |
| `disabled`⌚︎ | `boolean` | `false`     | Whether the menu item is disabled. If `true`, the menu item will not be clickable and will be displayed in a disabled state. (The value of the attribute will be evaluated as a JavaScript expression) | `disabled`<br>`disabled="true"`             |
| `style`⌚︎    | `string`  | `undefined` | The CSS style to apply to the menu item. This can be used to customize the appearance of the menu item.                                                                                                | `style="color: red;"`                       |

## HTML Examples
```html
<nav>
	<th-menu src="menu.js" orientation="horizontal"></th-menu>
</nav>
```

```html
<nav>
	<th-menu>
		<th-menu-item label="lorem" href="lorem.html" icon="img/lorem.png">
			<th-menu>
				<th-menu-item label="consectetur" href="consectetur.html" icon="person"></th-menu-item>
				<th-menu-item label="adipiscing" href="adipiscing.html" icon="check">
					<th-menu>
						<th-menu-item label="hendrerit" href="hendrerit.html"></th-menu-item>
						<th-menu-item label="bibendum" href="bibendum.html"></th-menu-item>
					</th-menu>
				</th-menu-item>
				<th-menu-item label="felis" href="felis.html"></th-menu-item>
			</th-menu>
		</th-menu-item>
		<th-menu-item label="ipsum" href="ipsum.html" icon="undo"></th-menu-item>
		<th-menu-item label="dolor" href="dolor.html" icon="school"></th-menu-item>
		<th-menu-item label="amet" href="amet.html">
			<th-menu>
				<th-menu-item label="sit" href="sit.html"></th-menu-item>
				<th-menu-item label="sapien" href="sapien.html"></th-menu-item>
			</th-menu>
		</th-menu-item>
	</th-menu>
</nav>
```

## JavaScript Example
```javascript
// menu.js (dummy example)
const menu = [
	{ label: "Home", href: "index.html" },
	{
		label: "Courses",
		icon: "book",
		children: [
			{ label: "Course 1", href: "courses/01.html" },
			{ label: "Course 2", href: "courses/02.html", disabled: true }
		]
	},
	{ label: "Contact", href: "contact.html" }
];
// Possible data manipulation here.
// For example, you can add a new item to the menu

export default menu;
```

## JSON Example
```json
[
	{
		"label": "Home",
		"href": "index.html"
	},
	{
		"label": "Courses",
		"icon": "book",
		"children": [
			{
				"label": "Course 1",
				"href": "courses/01.html"
			},
			{
				"label": "Course 2",
				"href": "courses/02.html",
				"disabled": true
			}
		]
	},
	{
		"label": "Contact",
		"href": "contact.html"
	}
]
```

## TODO
- `src` attribute: load the menu from a JSON file or a JavaScript file.
- Use `focus-within` to manage focus on the menu items.
- Manage the 'hamburger' menu for mobile devices.

## To document
- Properties
- Methods
- Events
- Slots
- CSS Variables
- CSS Classes