import TheophileElement from "../TheophileElement.js";
import MenuItem from "./MenuItem.js";
export default class Menu extends TheophileElement {
	constructor() {
		super();
		this.complete = false;
	}
	static get observedAttributes() {
		return this.defineAttributes({
			src: {
				get: function () { return this._src; },
				set: function (value) {
					if (value === this._src?.href) return;
					this._src = new URL(value, location);
					this.setAttribute("src", this._src);
					this.manageSrc(this._src);
				},
			},
		});
	}
	manageSrc(src) {
		if (src.href.endsWith(".js")) {
			this.fetchJs(src);
		} else if (src.href.endsWith(".json")) {
			this.fetchJson(src);
		} else if (src.href.endsWith(".html")) {
			this.fetchHTML(src);
		} else if (src.href.endsWith(".txt")) {
			this.fetchTxt(src);
		} else {
			console.error("Unsupported file type:", src.href);
		}
	}
	async fetchJs(src) {
		try {
			const module = await import(src.href);
			this.parse(module.default);
		} catch (error) {
			console.error("Error loading module:", error);
		}
	}
	async fetchJson(src) {
		try {
			const response = await fetch(src.href);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			this.parse(data);
		} catch (error) {
			console.error("Error fetching JSON:", error);
		}
	}
	async fetchHTML(src) {
		try {
			const response = await fetch(src.href);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(data, "text/html");
			const items = doc.body.firstChild.children;
			[...items].forEach((item) => {
				this.appendChild(item);
			});
			this.dispatchEvent(new Event("load"));
		} catch (error) {
			console.error("Error fetching HTML:", error);
		}
	}
	async fetchTxt(src) {
		try {
			const response = await fetch(src.href);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const txt = await response.text();
			const lines = txt.split(/\r\n|\n\r|\r|\n/);
			this.parseTxt(lines);
			this.dispatchEvent(new Event("load"));
		} catch (error) {
			console.error("Error fetching TXT:", error);
		}
	}
	connectedCallback() {
		// this.shadowRoot.appendChild(this.DOM.link());
		if (this.complete) return;
		this.shadowRoot.appendChild(this.DOM.main());
		this.complete = true;
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
	static parse(json) {
		return document.createElement(this.tagName).parse(json);
	}
	parseTxt(linesArray, indent = 0) {
		let item = null;
		while (linesArray.length > 0) {
			let lineIndent = linesArray[0].length - linesArray[0].trimStart().length;
			if (lineIndent < indent) return this;
			
			if (lineIndent > indent) {
				let submenu = Menu.parseTxt(linesArray, lineIndent);
				submenu.slot = "menu";
				item.appendChild(submenu);
			} else {
				item = MenuItem.parseTxt(linesArray.shift());
				this.appendChild(item);
			}
		}
		return this;
	}
	static parseTxt(linesArray, indent = 0) {
		return document.createElement(this.tagName).parseTxt(linesArray, indent);
	}
}
Menu.init(import.meta).addStyle();
