import TheophileElement from "../TheophileElement.js";
import Menu from "./Menu.js";

export default class MenuItem extends TheophileElement {

	constructor() {
		super();
		this.complete = false;
	}
	static get observedAttributes() {
		return this.defineAttributes({
			href: true,
			label: true,
			icon: true,
			children: true,
			disabled: true,
			tab: true,
			src: true,
		});
	};
	adoptedCallback() {
		console.log("adopted", this);
	}
	connectedCallback() {
		if (this.complete) return;		
		// this.shadowRoot.appendChild(MenuItem.DOM.link("style2.css", this.meta));
		this.shadowRoot.appendChild(this.DOM.main());
		this.appendChild(this.DOM.label());
		TheophileElement.wrap(this.querySelectorAll(":scope>th-menu-item"), 'th-menu');
		this.querySelectorAll(":scope>th-menu").forEach((child) => {
			child.slot = "menu";
		});
		this.complete = true;
	}
	connectedMoveCallback(elt) {
		console.log(arguments);
		
		if (elt.tagName === "TH-MENU-ITEM") {
			elt.slot = "menu";
		}
	}
	get_href() {
		return this.getAttribute("href");
	}
	set_href(value) {
		this.setAttribute("href", value);
	}
	get_children() {
		return this.querySelectorAll(":scope>th-menu-item");
	}
	set_children(value) {
		const children = Menu.parse(value);
		this.appendChild(children);
	}
	get_src() {
		return this.getAttribute("src");
	}
	set_src(value) {
		const sub = document.createElement("th-menu");
		sub.setAttribute("src", value);
		sub.setAttribute("slot", "menu");
		this.appendChild(sub);
		sub.addEventListener("load", (e) => {
			const menus = [...this.querySelectorAll(":scope>th-menu")];
			
			const first = menus.shift();
			menus.forEach((menu) => {
				while (menu.firstElementChild) {
					first.appendChild(menu.firstElementChild);
				}
				menu.remove();
			});
		});
	}
	DOM = {
		main: () => {
			const result = document.createDocumentFragment();
			result.appendChild(this.DOM.style());
			result.appendChild(TheophileElement.DOM.slot("label"));
			result.appendChild(TheophileElement.DOM.slot("menu"));
			return result;
		},
		label: () => {			
			let label = this.DOM.label0();
			label.slot = 'label';
			label.appendChild(TheophileElement.DOM.slot());
			if (this.hasAttribute('icon')) {
				let icon = this.getAttribute('icon');
				if (!icon.match('^[a-z0-9_]+$')) {
					label.setAttribute('data-icon', '');
					label.style.setProperty('--icon', `url(${new URL(icon, location.href).href})`);
					// label.insertBefore(this.DOM.icon(this.getAttribute('icon')), label.firstChild);
				} else {
					label.setAttribute('data-icon', this.getAttribute('icon'));
				}
			}
			if (this.hasAttribute('disabled')) {
				label.classList.add('th-disabled');
			}
			return label;
		},
		label0: () => {
			if (!this.hasAttribute("href")) {
				return this.DOM.span(this.getAttribute("label"));
			}
			let result;
			let href = new URL(this.getAttribute("href"), location.href);
			result = this.DOM.a(this.getAttribute("label"), this.getAttribute("href"));
			if (this.hasAttribute("tab")) {
				result.setAttribute("target", "_blank");
			}
			return result;
		},

		span: (text) => {
			const result = document.createElement("span");
			result.textContent = text;
			return result;
		},
		a: (text, href) => {
			const result = document.createElement("a");
			result.textContent = text;
			result.href = href;
			return result;
		},
		icon: (icon) => {
			if (!icon) return document.createDocumentFragment();
			const result = document.createElement("img");
			result.src = new URL(icon, location.href).href;
			result.alt = "";
			return result;
		},
		link: (url = "style.css") => {
			const link = document.createElement("link");
			link.rel = "stylesheet";

			link.href = new URL(url, location.href).href;
			return link;
		},
		style: (css = '') => {
			const style = document.createElement("style");
			style.textContent = `::slotted(th-menu) {z-index: 100;}` + css;
			return style;
		},
	};
	static parse(json) {
		return document.createElement(this.tagName).parse(json);
	}
	parse(obj) {
		for (const [key, value] of Object.entries(obj)) {
			this[key] = value;
		}
		// ["label", "href", "icon", "disabled", "tab"].forEach((key) => {
		// 	if (json[key]) {
		// 		this.setAttribute(key, json[key]);
		// 	}
		// });

		// if (json.children) {
		// 	const children = Menu.parse(json.children);
		// 	this.appendChild(children);
		// }
		return this;
	}
	parseTxt(line) {
		line = line.trim().split("|");
		["label", "href", "icon"].forEach((attr, i) => {
			if (line[i]) {
				this[attr] = line[i];
			}
		});

		return this;
	}
	static parseTxt(line) {
		if (line.trim().length === 0) return document.createDocumentFragment();
		return document.createElement(this.tagName).parseTxt(line);
	}

}
MenuItem.init(import.meta);

