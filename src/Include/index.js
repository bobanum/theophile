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

					this.load(this._href).then(doc => {
						while (this.firstChild) {
							this.firstChild.remove();
						}
						while (doc.activeElement.firstChild) {
							this.appendChild(doc.activeElement.firstChild);
						}
					});
				},
			},
		});
		// 	const properties = this.defineAttributes({});
		// 	properties = {
		// 		href: {
		// 			type: String,
		// 			reflect: true,
		// 			attribute: "href",
		// 			observer: "hrefChanged"
		// 		}
		// 	};
		// 	return Object.keys(properties).filter(key => properties[key].reflect);
	};
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("connectedCallback", this._href);

		this.shadowRoot.appendChild(document.createElement("slot"));
		return;
		this.shadowRoot.appendChild(this.DOM.main());
		this._headings = Array.from(document.body.querySelectorAll('h1,h2,h3'));
		const hierarchy = this.getHierarchy(this._headings);
		const list = this.DOM.ul(hierarchy);
		list.slot = "list";
		const toplink = this.DOM.toplink();
		this._headings.forEach(heading => {
			heading.appendChild(this.DOM.permalink(heading));
			heading.appendChild(toplink.cloneNode(true));
		});
		this.appendChild(list);
	}
	DOM = {};
}
customElements.define('th-include', Include);