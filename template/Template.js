export default class Template extends HTMLElement {
	static observedAttributes = ["href"];
	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
	}
	get href() {
		return this.getAttribute("href");
	}
	set href(value) {
		this.setAttribute("href", value);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "href" && oldValue !== newValue) {
			this.load(newValue).then(doc => {
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
	load(templateUrl) {
		return fetch(templateUrl)
			.then(response => response.text())
			.then(template => {
				template = this.cleanup(template);
				const parser = new DOMParser();
				const doc = parser.parseFromString(template, 'text/html');
				this.dispatchEvent(new CustomEvent("load", { detail: { template: doc } }));
				return doc;
			})
			.catch(error => console.error('Error loading template:', error));
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