import Webponent from '../Webponent.js';

export class Template extends Webponent {
	static cache = {};
	defaultTemplate = "template/index.html";
	constructor() {
		super();
		if (!this.hasAttribute('href')) {
			this.href = this.defaultTemplate;
		}		
	}
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

				el.setAttribute(attr, this.convertUrl(attrValue));
			});
		});
	}
	convertUrl(url) {
		if (this.href.match(/^[^\/]+\.html(#.*)?$/)) return url;
		if (url.startsWith('./')) {
			return new URL(url.slice(2), this.url).href;
		} else {
			return new URL(url, location).href;
		}
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
				if (!value.match(/\.html(#.*)?$/)) {
					value = value.replace(/\/?(#.*)?$/, "/index.html$1");
				}
				this.url = value;
				Template.getTemplate(this.url).then((doc) => {
					this.shadowRoot.innerHTML = "";
					this.applyTemplate(doc);
				});
			},
		},
	};
	applyTemplate(doc) {
		this.shadowRoot.innerHTML = "";
		const styles = [...doc.head.querySelectorAll("link[rel='stylesheet'], style")];
		styles.forEach(style => {
			if (style.tagName === "LINK") {
				style.href = this.convertUrl(style.getAttribute("href"));
			}
			this.appendChild(style);
		});

		const element = (this.url.hash) ? doc.querySelector(this.url.hash) : (doc.querySelector("template:not([id])") || doc.querySelector("template"));
		if (element) {
			let tpl = element.content.cloneNode(true);
			this.convertUrls(tpl);
			this.shadowRoot.appendChild(tpl);
		} else {
			this.shadowRoot.innerHTML = `<p>Template "${this.url.href}" not found.</p>`;
		}
	}
	static addStylesheet(href, to = document.head) {
		const result = document.createElement("link");
		result.rel = "stylesheet";
		result.href = href;
		to.appendChild(result);
		return result;
	}
}
Template.register("template");
export default Template;