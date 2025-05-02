export default class TheophileElement extends HTMLElement {
	static defineAttributes(properties) {
		Object.defineProperties(this.prototype, properties);
		return Object.keys(properties);
	}
	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}
		this[name] = newValue;
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
	cleanup(html) {
		const start = "<!-- Code injected by live-server -->";
		const end = "</script>";
		let result = this.excludeText(html, start, end);
		return result;
	}
	excludeText(text, start, end) {
		const startIndex = text.indexOf(start);
		const endIndex = text.indexOf(end, startIndex + start.length);
		if (startIndex !== -1 && endIndex !== -1) {
			return text.substring(0, startIndex) + text.substring(endIndex + end.length);
		}
		return text;
	}
	rebaseHtmlUrls(html) {
		const r = "(action|cite|content|data|formaction|href|imagesizes|imagesrcset|longdesc|poster|src|srcdoc|srcset|usemap)" +
			"\\s*=\\s*" +
			"([\"'])" +
			"(.*?)" +
			"\\2";
		const regex = new RegExp(r, "g");
		html = html.replace(regex, (dummy, attr, quot, val) => {
			return `${attr}=${quot}${this.rebaseURL(val)}${quot}`;
		});
		return html;
	}
	rebaseCssUrls(html) {
		const r = "url\\(([^\\)]*)\\)";
		const regex = new RegExp(r, "g");
		html = html.replace(regex, (dummy, url) => {
			return `url(${this.rebaseURL(url)})`;
		});
		return html;
	}

	async load(url) {
		try {
			const response = await fetch(url);
			let html = await response.text();
			html = this.cleanup(html);
			html = this.rebaseHtmlUrls(html);
			html = this.rebaseCssUrls(html);

			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			this.dispatchEvent(new CustomEvent("load", { detail: { template: doc } }));
			return doc;
		} catch (error) {
			return console.error('Error loading file:', error);
		}
	}
}
