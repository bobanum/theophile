import Theophile from "../../Theophile.js";
import Plugin from "../Plugin.js";
export default class Reference extends Plugin {
	static refsDocuments = {};
	static async init(Theophile) {

		await super.init(Theophile);
	}
	static findReferences() {
		var refs = Array.from(document.querySelectorAll(".th-references"));
		var promises = refs.map(group => {
			return this.processGroup(group);
		});
		return Promise.all(promises);
	}
	static async processGroup(group, remove = true) {
		console.log("Reference.init");
		const result = await this.fetchGroup(group);
		group.ownerDocument.head.appendChild(result.head);
		group.parentNode.insertBefore(result.body, group);
		if (remove) {
			group.parentNode.removeChild(group);
		}
	}
	static async fetchGroup(group, result = null) {
		result = result || this.fragments();
		var refs = Array.from(group.querySelectorAll("a"));

		const promises = refs.map(ref => {
			ref.remove();
			return this.fetchRef(ref);
		});
		const docs = await Promise.all(promises);
		docs.forEach(doc => {
			result.head.appendChild(doc.head);
			result.body.appendChild(doc.body);
		});
		while (group.firstChild) {
			result.body.appendChild(group.firstChild);
		}
		return result;
	}
	static fetchRef(ref) {
		const href = ref.getAttribute("href");
		return this.processUrl(href);
	}
	static async processRef(ref, remove = true) {
		const href = ref.getAttribute("href");
		const { head, body } = await this.processUrl(href);
		ref.ownerDocument.head.appendChild(head);
		ref.parentNode.insertBefore(body, ref);
		if (remove) {
			ref.parentNode.removeChild(ref);
		}
	}
	static async processUrl(url, result = null) {
		result = result || this.fragments();
		const [href, id] = url.split("#");
		const doc = await this.getRefDocument(href);
		if (id) {
			console.error("Todo"); //TODO
		} else {
			result.body.appendChild(this.dom.permalink(url));
			return this.processDoc(doc, result);
		}
	}
	static fragments() {
		return { head: document.createDocumentFragment(), body: document.createDocumentFragment() };
	}
	static processDoc(doc, result = null) {
		result = result || this.fragments();
		doc.head.querySelectorAll("style,link").forEach(element => {
			let url = element.getAttribute("href") || element.getAttribute("src");
			Theophile.addExternal(url, result.head.appendChild(element));
		});
		while (doc.body.firstChild) {
			result.body.appendChild(doc.body.firstChild);
		}
		return result;
	}
	static zzzgetRefDocument(url) {
		url = url.split("#")[0];
		if (this.refsDocuments[url]) {
			return Promise.resolve(this.refsDocuments[url]);
		}
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", url);
			xhr.responseType = "document";
			xhr.addEventListener("load", e => {
				const response = e.target.response;
				this.refsDocuments[url] = response;
				resolve(response);
			});
			xhr.send();
		});
	}
	/**
	 * Retrieves the reference document based on the provided URL.
	 * @param {string} url - The URL of the reference document.
	 * @returns {Promise} - A promise that resolves with the reference document.
	 */
	static async getRefDocument(url) {
		url = url.split("#")[0];
		if (this.refsDocuments[url]) {
			return Promise.resolve(this.refsDocuments[url]);
		}
		if (url.endsWith(".html") || url.endsWith(".htm")) {
			this.refsDocuments[url] = await this.getRefHtml(url);
		} else if (url.endsWith(".md")) {
			this.refsDocuments[url] = await this.getRefMarkdown(url);
		} else {
			console.error("Unknown file type", url);
		}
		return this.refsDocuments[url];
	}
	/**
	 * Fetches HTML content from the specified URL and returns it as a parsed document.
	 * @param {string} url - The URL to fetch the HTML content from.
	 * @returns {Promise<Document>} - A promise that resolves to the parsed document.
	 * @throws {Error} - If there is an HTTP error or if fetching the HTML fails.
	 */
	static async getRefHtml(url) {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			return doc;
		} catch (error) {
			throw new Error(`Failed to fetch HTML: ${error.message}`);
		}
	}
	/**
	* Retrieves the markdown content from the specified URL and returns it as a Promise.
	* If the content has already been fetched before, it will be retrieved from cache.
	*
	* @param {string} url - The URL of the markdown content.
	* @returns {Promise<HTMLDivElement>} A Promise that resolves to the HTMLDivElement containing the markdown content.
	*/
	static async getRefMarkdown(url) {
		try {
			// Fetch the markdown content
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			// Parse the markdown content using marked.js
			const markdownText = await response.text();
			var htmlContent = marked.parse(markdownText);
			const refUrls = [...htmlContent.matchAll(/(href|src)="([^"]+)"/g)];
			refUrls.forEach(refUrl => {
				if (refUrl[2].startsWith("http")) return;
				var root = new URL(url).href.split("/").slice(0, -1).join("/");
				console.log(root);
				if (refUrl[2].startsWith("/")) {
					var abs = refUrl[0].replace(refUrl[2], root + refUrl[2]);
				} else {
					var abs = refUrl[0].replace(refUrl[2], root + "/" + refUrl[2]);
				}
				console.log(abs, refUrl[0]);
				htmlContent = htmlContent.replace(refUrl[0], abs);
			});

			// Create an HTML document and set the body content
			const doc = document.implementation.createHTMLDocument();
			doc.body.innerHTML = htmlContent;
			return doc;
		} catch (error) {
			throw new Error(`Failed to fetch and parse markdown: ${error.message}`);
		}
	}
	static async prepare() {
		await super.prepare();
		const data = await this.findReferences();
		return data;
	}
	static dom = {
		permalink: (url, title = "🔗&#xFE0E;") => {
			const a = document.createElement("a");
			a.classList.add("th-permalink");
			a.href = url;
			a.innerHTML = title;
			return a;
		}
	}
}
class ThReference extends HTMLElement {
	constructor() {
		super();
		const fragments = Reference.fragments();
		new Promise(resolve => {
			if (!this.hasAttribute("href")) return resolve(fragments);
			fragments.body.appendChild(Reference.dom.permalink(this.getAttribute("href")));
			resolve(Reference.processUrl(this.getAttribute("href"), fragments));
		}).then(fragments => {
			return Reference.fetchGroup(this, fragments)
		}).then(data => {
			document.head.appendChild(data.head);
			this.parentNode.insertBefore(data.body, this);
			this.parentNode.removeChild(this);
		});
	}
}
customElements.define("th-reference", ThReference);
