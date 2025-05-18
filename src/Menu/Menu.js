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
						console.log("Module loaded:", module);
						
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
			let slotLabel = document.createElement("slot");
			// slotLabel.name = "label";
			// result.appendChild(slotLabel);
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
	parse(json, attributes = {slot:"nav"}) {
		for (const [key, value] of Object.entries(attributes)) {
			this.setAttribute(key, value);
		}
		for (const [key, value] of Object.entries(json)) {
			console.log(key, value);
			
			const child = MenuItem.parse(value);
			this.appendChild(child);
		}
		return this;
	}
	static parse(json, attributes = {slot:"nav"}) {
		const result = document.createElement(this.tagName);
		result.parse(json, attributes);
		return result;
	}
	static parseRoot(json, attributes = {slot:"nav"}) {
		const result = document.createElement("th-menu");
		for (const [key, value] of Object.entries(attributes)) {
			result.setAttribute(key, value);
		}
		for (const [key, value] of Object.entries(json)) {
			console.log(key, value);
			
			const child = this.parse(key, value);
			result.appendChild(child);
		}
		return result;
	}
	// static parse(label, json) {
	// 	console.log(label, json);
		
	// 	const result = document.createElement("th-menu-item");
	// 	["label", "href", "icon", "disabled", "tab"].forEach((key) => {
	// 		if (json[key]) {
	// 			result.setAttribute(key, json[key]);
	// 		}
	// 	});

	// 	if (json.children) {
	// 		const children = this.parseChildren(json.children);
	// 		result.appendChild(children);
	// 	}
	// 	return result;
	// }
	static parseChildren(children) {
		const result = document.createElement("th-menu");
		for (const [key, value] of Object.entries(children)) {
			const child = this.parse(key, value);
			result.appendChild(child);
		}
		return result;
	}
}
Menu.init(import.meta).addStyle();
