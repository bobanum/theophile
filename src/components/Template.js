import Webponent from './Webponent.js';

export class Template extends Webponent {
	static cache = [];
	connectedCallback() {
		console.log(this.href);
	}
	async getTemplate(url = this.url) {
		if (Template.cache[url.pathname]) {
			return Template.cache[url.pathname];
		}
		const response = await fetch(url);
		const text = await response.text();
		const domParser = new DOMParser();
		const doc = domParser.parseFromString(text, 'text/html');
		Template.cache[url.pathname] = doc;
		return doc;
	}
	convertUrls(doc) {
		if (!this.href.includes("/")) return;
		const attributes = ['href', 'src', 'action', 'data'];

		attributes.forEach(attr => {
			doc.querySelectorAll(`[${attr}]`).forEach(el => {
				const attrValue = el.getAttribute(attr);
				const url = new URL(el.getAttribute(attr), this.url);
				console.log(attrValue, url);

				el.setAttribute(attr, url.href);
			});
		});
	}
	get url() {
		return this._url;
	}
	set url(value) {

		if (typeof value === 'string') {
			value = new URL(value, location);
		}

		if (this._url !== value) {
			this._url = value;
		}
	}
	static properties = {
		href: {
			type: String,
			get: function () {
				console.log("ok");

				return this.getAttribute('href');
			},
			set: function (value) {
				this.url = value;
				this.getTemplate(this.url).then((doc) => {
					this.shadowRoot.innerHTML = "";

					const element = (this.url.hash) ? doc.querySelector(this.url.hash) : (doc.querySelector("template:not([id])") || doc.querySelector("template"));
					if (element) {
						let tpl = element.content.cloneNode(true);
						this.convertUrls(tpl);
						this.shadowRoot.appendChild(tpl);
					} else {
						this.shadowRoot.innerHTML = `<p>Template not found.</p>`;
					}
				});
			},
		},
	};
}
Template.register();
export default Template;