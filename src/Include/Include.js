import TheophileElement from "../TheophileElement.js";
export default class Include extends TheophileElement {
	static get observedAttributes() {
		return this.defineAttributes({
			href: {
				get: function () { return this._href; },
				set: function (value) {
					if (value === this._href) {
						return;
					}
					this._href = new URL(value, location).href;
					this.setAttribute("href", this._href);

					Include.addTask(this);
					this.load(this._href).then(doc => {
						while (this.firstChild) {
							this.firstChild.remove();
						}

						if (!doc.querySelector("body>h1,body>header")) {
							this.appendChild(this.DOM.title(doc.title));
						}

						while (doc.activeElement.firstChild) {
							this.appendChild(doc.activeElement.firstChild);
						}
						Include.removeTask(this);
					});
				},
			},
		});
	};
	constructor() {
		super();
	}

	connectedCallback() {
		this.shadowRoot.appendChild(document.createElement("slot"));
		return;
	}
	DOM = {
		title: (text) => {
			const result = document.createElement("h1");
			result.textContent = text;
			return result;
		},
		permalink: () => {
			const result = document.createElement("a");
			result.classList.add("th-permalink");

			result.href = this._href;
			return result;
		},
	};
}
Include.init(import.meta);
