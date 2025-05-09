import TaskList from "../TaskList.js";
import TheophileElement from "../TheophileElement.js";

export default class Template extends TheophileElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return this.defineAttributes({
			href: {
				get: function () { return this._href; },
				set: function (value) {
					if (value === this._href) {
						return;
					}
					this._href = new URL(value, location).href;
					Template.addTask(this);
					this.load(this._href).then(doc => {
						const content = [...(doc.querySelector("template")?.content.childNodes || doc.querySelector("body").childNodes)];
						content.forEach(element => {
							this.shadowRoot.appendChild(element);
						});
						doc.querySelectorAll("head > link", "head > script", "head > style").forEach((el) => {
							this.appendChild(el);
						});
						this.dispatchEvent(new CustomEvent("ready", { detail: { template: doc } }));
						this.dispatchEvent(new CustomEvent("load", { detail: { template: doc } }));
					});
					this.setAttribute("href", this._href);
				},
			},
		});
	};
	static apply(templateUrl, selector = "body") {		
		return new Promise((resolve, reject) => {
			const element = document.querySelector(selector);
			const template = document.createElement('th-template');
			template.setAttribute("href", templateUrl);
			while (element.firstChild) {
				template.appendChild(element.firstChild);
			}
			element.appendChild(template);
			template.addEventListener("load", () => {
				resolve(template.shadowRoot);
			});
		});
	}
}
Template.location = new URL(import.meta.url);
customElements.define('th-template', Template);