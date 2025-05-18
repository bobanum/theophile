import TheophileElement from "../TheophileElement.js";
import MenuItem from "./MenuItem.js";
export default class Menu extends TheophileElement {
	constructor() {
		super();
		if (this.hasAttribute("src")) {
			this.manageSrc(this.getAttribute("src"));
		}
	}
	manageSrc(src) {
		if (this.hasAttribute("src")) {
			let src = new URL(this.getAttribute("src"), location.href);
			if (src.href.endsWith(".js")) {
				import(src.href)
					.then((module) => {
						// console.log("Module loaded:", module);
						this.parse(module.default);
					})
					.catch((error) => {
						console.error("Error loading module:", error);
					});
			}
		}
	}
	connectedCallback() {
		// this.appendChild(this.DOM.label());
		this.shadowRoot.appendChild(this.DOM.main());
	}
	DOM = {
		main: () => {
			const result = document.createDocumentFragment();
			result.appendChild(document.createElement("slot"));
			return result;
		},
		link: (url = "style.css") => {
			const link = document.createElement("link");
			link.rel = "stylesheet";

			link.href = new URL(url, import.meta.url).href;
			return link;
		},
	};
	parse(array) {
		array.forEach((item) => {
			this.appendChild(MenuItem.parse(item));
		});
		return this;
	}
	parse0(json) {
		for (const [key, value] of Object.entries(json)) {
			console.log(key, value);
			
			const child = MenuItem.parse(value);
			this.appendChild(child);
		}
		return this;
	}
	static parse(json) {
		return document.createElement(this.tagName).parse(json);
	}
}
Menu.init(import.meta).addStyle();
