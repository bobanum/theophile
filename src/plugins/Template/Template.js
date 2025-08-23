import "../../Theophile.js";
import Theophile from "../../Theophile.js";
import Plugin from "../Plugin.js";

export default class Template extends Plugin {
	static async init(Theophile) {
		await super.init(Theophile);
		this.processiframes = (this.processiframes === undefined) ? true : this.processiframes;
	}
	static get url() {
		return this.Theophile.siteURL("template.html");
	}
	static async load() {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", this.url);
			xhr.responseType = "document";
			xhr.addEventListener("load", e => {
				resolve(e.target.response);
			});
			xhr.send();
		});
	}
	static async prepare() {
		await super.prepare();
		this.template = await this.load();
		// this.template.querySelectorAll("script").forEach(script => {
		//     if (script.innerHTML.indexOf('For SVG support') >= 0) {
		//         script.remove();
		//     }
		// });
		this.template
			.querySelectorAll("[src],[href],[data]")
			.forEach(element => {
				["src", "href", "data"].forEach(name => {
					const url = element.getAttribute(name);
					if (url) {
						element.setAttribute(name, this.Theophile.siteURL(url));
					}
				});
			});
	}
	static async process() {
		await super.process();
		this.processAllIframes(document.body);
	}
	static async mount() {
		await super.mount();
		const externalElements = document.head.querySelectorAll("[href],[src]");
		externalElements.forEach(element => {
			let url = element.getAttribute("href") || element.getAttribute("src");
			Theophile.addExternal(url, element);
		});
		var promises = Array.from(this.template.querySelectorAll("link"), link => {
			return new Promise(resolve => {
				link.addEventListener("load", e => {
					resolve(e);
				});
			});
		});
		this.moveContainers(".container");
		this.template.querySelectorAll("link,style,script").forEach(element => {
			let url = element.getAttribute("href") || element.getAttribute("src");
			let external = Theophile.getExternal(url, element);
			if (element.tagName === "SCRIPT") {
				external = this.cloneScript(external);
			}
			document.head.insertBefore(external, document.head.firstChild);
		});
		return Promise.all(promises);
	}
	static cloneScript(script) {
		const newScript = document.createElement("script");
		[...script.attributes].forEach(attr => {
			newScript.setAttribute(attr.name, attr.value);
		});
		newScript.textContent = script.textContent;
		return newScript;
	}
	static moveContainers(selector) {
		const containers = this.template.querySelectorAll(selector);
		containers.forEach(container => {
			var selector = container.getAttribute("data-selector");
			var contents = document.querySelector(selector);
			if (!contents) return false;
			while (container.firstChild) {
				container.firstChild.remove();
			}
			this.moveChildNodes(contents, container);
		});
		this.moveChildNodes(this.template.body, document.body);
	}

	static moveChildNodes(from, to = document.body) {
		while (from.firstChild) {
			const child = from.firstChild;
			// PATCH: Remove live-server script and comments
			if (child.nodeType === Node.COMMENT_NODE && child.textContent.indexOf("live-server") >= 0) {
				while (child.nextSibling?.nodeType === Node.TEXT_NODE) {
					child.parentNode.removeChild(child.nextSibling);
				}
				if (child.nextSibling?.tagName === "SCRIPT") {
					child.nextSibling.remove();
				}
				child.parentNode.removeChild(child);
				continue;
			}
			to.appendChild(child);
		}
	}

	static async clean() {
		await super.clean();
		document.querySelectorAll(".th-contrast").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				document.querySelectorAll(".main").forEach(element => {
					var style = window.getComputedStyle(element);
					var color = style.color;
					var backgroundColor = style.backgroundColor;
					element.style.color = backgroundColor;
					element.style.backgroundColor = color;
				});
			});
		});
		document.querySelectorAll(".th-size").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				document.querySelectorAll(".main").forEach(element => {
					if (e.ctrlKey) {
						element.style.removeProperty("font-size");
						return;
					}
					var size = parseFloat(element.style.fontSize) || 1;
					size += e.shiftKey ? -0.5 : 0.5;
					if (size > 2) {
						size = 0.5;
					}
					if (size < 0.5) {
						size = 2;
					}
					element.style.fontSize = size + "em";
				});
			});
		});
	}
	static processAllIframes(domain) {
		// Escaping html code in pre>code>iframe and removine iframe
		domain.querySelectorAll("pre>code>iframe").forEach(iframe => {
			iframe.parentNode.textContent = iframe.textContent;
		});

		if (this.processiframes) {
			domain.querySelectorAll("iframe[src]:not(.th-no-figure)").forEach(iframe => {
				this.processIframe(iframe);
			});
		}
		domain.querySelectorAll("iframe:not([src])").forEach(iframe => {
			this.processIframe(iframe);
			var src = `data:text/html,<!DOCTYPE html><meta charset="UTF-8"><html><body>${iframe.textContent.replace(/#/g, "%23")}</body></html>`;
			iframe.setAttribute("src", src);
			iframe.setAttribute("scrolling", "no");
			iframe.style.overflow = "hidden";
			iframe.classList.add("th-no-figure");
		});
	}
	static processIframe(iframe) {
		var figure = document.createElement("figure");
		figure.classList.add("iframe");
		if (iframe.style.width) {
			figure.style.width = iframe.style.width;
		} else {
			//TODO Is it OK?
			var style = window.getComputedStyle(iframe);
			figure.style.width = style.width;
		}
		iframe.parentNode.insertBefore(figure, iframe);
		figure.appendChild(iframe);
		var figcaption = figure.appendChild(document.createElement("figcaption"));
		figcaption.innerHTML = iframe.title;
		iframe.title = "";
		var a = figcaption.appendChild(document.createElement("a"));
		a.classList.add("open-in-new");
		a.target = "_blank";
		a.href = iframe.src;
		var span = a.appendChild(document.createElement("span"));
		//TODO : Localize
		a.title = span.innerHTML = "Ouvrir dans un nouvel onglet";
		return figure;
	}
}
