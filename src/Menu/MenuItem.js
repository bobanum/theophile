import TheophileElement from "../TheophileElement.js";
import Menu from "./Menu.js";

export default class MenuItem extends TheophileElement {
	connectedCallback() {
		// this.shadowRoot.innerHTML = `<style>
		// ::slotted(a) {
		// background:yellow;
		// 	display: grid;
		// 	grid-template-columns: 1fr 1fr 1fr;
		// }
		// </style>`;
		this.shadowRoot.appendChild(this.DOM.main());
		this.appendChild(this.DOM.label());
		TheophileElement.wrap(this.querySelectorAll(":scope>th-menu-item"), 'th-menu');
		this.querySelectorAll(":scope>th-menu").forEach((child) => {
			child.slot = "menu";
		});
	}
	DOM = {
		main: () => {
			const result = document.createDocumentFragment();
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
	};
	static parse(json) {
		const result = document.createElement(this.tagName);
		result.parse(json);
		return result;
	}
	parse(json) {
		["label", "href", "icon", "disabled", "tab"].forEach((key) => {
			if (json[key]) {
				this.setAttribute(key, json[key]);
			}
		});

		if (json.children) {
			const children = Menu.parse(json.children);
			this.appendChild(children);
		}
		return this;
	}
	static parseChildren(children) {
		const result = document.createDocumentFragment();
		for (const [key, value] of Object.entries(children)) {
			const child = this.parse(key, value);
			result.appendChild(child);
		}
		return result;
	}

}
MenuItem.init(import.meta);

