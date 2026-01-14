import Webponent from '../Webponent.js';

export class Template extends Webponent {
	static cache = {};
	static getTemplate(url = this.url) {
		if (!this.cache[url.pathname]) {
			this.cache[url.pathname] = fetch(url).then(response => response.text());
		}
		if (!(this.cache[url.pathname] instanceof Promise)) {
			return Promise.resolve(this.cache[url.pathname]);
		}
		return this.cache[url.pathname].then(text => {
			const domParser = new DOMParser();
			const doc = domParser.parseFromString(text, 'text/html');
			this.cache[url.pathname] = doc;
			return doc;
		});
	}
	parseText(text) {
		const domParser = new DOMParser();
		const doc = domParser.parseFromString(text, 'text/html');
		return doc;
	}
	convertUrls(doc) {
		if (this.href.match(/^[^\/]+\.html(#.*)?$/)) return;
		const attributes = ['href', 'src', 'action', 'data'];

		attributes.forEach(attr => {
			doc.querySelectorAll(`[${attr}]`).forEach(el => {
				const attrValue = el.getAttribute(attr);
				
				if (attrValue.startsWith('~/')) {
					el.setAttribute(attr, new URL(attrValue.slice(2), this.url).href);
				} else if (attrValue.startsWith('././')) {
					el.setAttribute(attr, new URL(attrValue.slice(4), this.url).href);
				} else {
					el.setAttribute(attr, new URL(attrValue, location).href);
				}
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
				return this.getAttribute('href');
			},
			set: function (value) {
				console.log(value);
				
				if (!value.match(/\.html(#.*)?$/)) {
					value = value.replace(/\/?(#.*)?$/, "/index.html$1")
				}
				this.url = value;
				Template.getTemplate(this.url).then((doc) => {
					this.shadowRoot.innerHTML = "";

					const element = (this.url.hash) ? doc.querySelector(this.url.hash) : (doc.querySelector("template:not([id])") || doc.querySelector("template"));
					if (element) {
						let tpl = element.content.cloneNode(true);
						this.convertUrls(tpl);
						this.shadowRoot.appendChild(tpl);
					} else {
						this.shadowRoot.innerHTML = `<p>Template "${this.url.href}" not found.</p>`;
					}
				});
			},
		},
	};
}
Template.register("template");
export default Template;