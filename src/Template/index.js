export default class Template extends HTMLElement {
	static observedAttributes = ["href"];
	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this._href = null;
	}
	get href() {
		return this._href;
	}
	set href(value) {
		this.setAttribute("href", value);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "href" && oldValue !== newValue) {
			this._href = new URL(newValue, location).href;
			this.load(this._href).then(doc => {
				const content = [...(doc.querySelector("template")?.content.childNodes || doc.querySelector("body").childNodes)];
				content.forEach(element => {
					this.shadowRoot.appendChild(element);
				});
				doc.querySelectorAll("head > link", "head > script", "head > style").forEach((el) => {
					this.appendChild(el);
				});
			});
		}
	}
	rebaseURL(url, base = this._href) {
		if (url.match(/[<>"`{}|\\^[\]' ()]/) || url.startsWith("javascript:") || url.startsWith("data:")) {
			return url;
		}
		const result = new URL(url, base);
		if (!result) {
			return url;
		}
		return result.href;
	}
	excludeText(text, start, end) {
		const startIndex = text.indexOf(start);
		const endIndex = text.indexOf(end, startIndex + start.length);
		if (startIndex !== -1 && endIndex !== -1) {
			return text.substring(0, startIndex) + text.substring(endIndex + end.length);
		}
		return text;
	}
	cleanup(html) {
		const start = "<!-- Code injected by live-server -->";
		const end = "</script>";
		let result = this.excludeText(html, start, end);
		return result;
	}
	rebaseHtmlUrls(html) {	
		const r = "(action|cite|content|data|formaction|href|imagesizes|imagesrcset|longdesc|poster|src|srcdoc|srcset|usemap)"+
		"\\s*=\\s*"+
		"([\"'])"+
		"(.*?)"+
		"\\2";
		const regex = new RegExp(r, "g");
		html = html.replace(regex, (dummy, attr, quot, val)=> {
			return `${attr}=${quot}${this.rebaseURL(val)}${quot}`;
		});
		return html;
	}
	rebaseCssUrls(html) {	
		const r = "url\\(([^\\)]*)\\)";
		const regex = new RegExp(r, "g");
		html = html.replace(regex, (dummy,url)=> {			
			return `url(${this.rebaseURL(url)})`;
		});
		return html;
	}

	async load(templateUrl) {
		try {
			const response = await fetch(templateUrl);
			let template = await response.text();
			template = this.cleanup(template);
			template = this.rebaseHtmlUrls(template);
			template = this.rebaseCssUrls(template);

			const parser = new DOMParser();
			const doc = parser.parseFromString(template, 'text/html');
			this.dispatchEvent(new CustomEvent("load", { detail: { template: doc } }));
			return doc;
		} catch (error) {
			return console.error('Error loading template:', error);
		}
	}

	connectedCallback() {
		// this.render();
	}
	static apply(selector, templateUrl) {
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
customElements.define('th-template', Template);