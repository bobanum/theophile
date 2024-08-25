import Plugin from "../Plugin.js";
//TODO #23 When skipping headings (like h1+h3) collapsing doesn't work. Don't have the time to fix now
//TODO #24 Make scrolling smouth. For now, il scroll-behavious is smouth, page scrolls from top after ending slideshow.
//TODO #25 Toc: Make it possible to pin TOC on the page
export default class Toc extends Plugin {
	static tagName = "th-toc";
	constructor() {
		super();
		this.backlinks = this.hasAttribute("backlinks");
		this.permalinks = this.hasAttribute("permalinks");
		this.domain = this.getAttribute("domain") || "body";
		this.headings = Toc.headings = (this.getAttribute("headings") || "h1,h2,h3").toLowerCase().split(/\s*,\s*/);
		if (!this.id) this.id = Utils.findAnchor("th-toc");
		this.attachShadow({ mode: "open" });
	}
	connectedCallback() {
		const domain = document.querySelector(this.domain);

		if (!domain) {
			console.error("Domain not found: " + this.domain);
			return;
		}
		const headings = [...domain.querySelectorAll(this.headings)];
		const hierarchy = new Hierarchy(headings);
		if (this.title) {
			const title = document.createElement("h1");
			title.innerHTML = this.title;

			this.shadowRoot.appendChild(title);
			this.removeAttribute("title");
		}
		const html = hierarchy.html();
		if (this.backlinks) hierarchy.addBacklinks(this.id);
		if (this.permalinks) hierarchy.addPermalinks();
		this.shadowRoot.appendChild(html);
	}
	static getLevel(node) {
		return this.headings.indexOf(node.localName);
	}
	getLevel(node) {
		return this.constructor.getLevel(node);
	}
	async zzz_process() {
		await super.process();
		this._headings = Array.from(document.body.querySelectorAll(this.headings));
		this.hierarchy = this.getHierarchy(this._headings);
	}
	async zzz_afterMount() {
		await super.afterMount();
		const tocContainer = document.querySelector("#th-toc");
		if (this.speed) {
			tocContainer.style.setProperty("--speed", this.speed);
		}
		if (!tocContainer) return;
		const btnPin = tocContainer.appendChild(document.createElement("span"));
		btnPin.classList.add("th-toc-btn-pin");
		btnPin.addEventListener("click", _e => {
			document.documentElement.classList.toggle("th-toc-pin");
		});
		tocContainer.appendChild(this.html);
	}
	async zzz_clean() {
		super.clean();
		delete this.hierarchy;
		window.addEventListener("scroll", _e => {
			const visible = this.findVisibleHeading();
			if (visible.tocElement.classList.contains("th-toc-current")) {
				return;
			}
			document.querySelectorAll(".th-toc-current, .th-toc-current-within").forEach(element => element.classList.remove("th-toc-current", "th-toc-current-within"));
			visible.tocElement.classList.add("th-toc-current");
			var ptr = visible.tocElement;
			while (ptr) {
				if (ptr.id === "th-toc") break;
				ptr.classList.add("th-toc-current-within");
				ptr = ptr.parentNode.closest("li");
			}

		});
	}
	static get zzz_html() {
		return this.html_ul(this.hierarchy);
	}
	static html_ul(group, level = 1) {
		const result = document.createElement("ul");
		group.forEach(headingObject => {
			const li = result.appendChild(document.createElement("li"));
			li.classList.add("th-toc-level-" + level);
			if (headingObject.heading) {
				headingObject.heading.tocElement = li;
				li.destination = headingObject.heading;
				const div = li.appendChild(document.createElement("div"));
				const a = div.appendChild(document.createElement("a"));
				a.href = "#" + headingObject.heading.id;
				a.innerHTML = headingObject.heading.innerText;
			} else {
				li.classList.add("th-toc-no-heading");
			}
			if (headingObject.group.length) {
				li.appendChild(this.html_ul(headingObject.group, level + 1));
			}
		});
		return result;
	}
	zzz_getHierarchy(nodeList) {
		const result = [];
		var currentLevel = 0;
		const path = [result];
		nodeList.forEach(heading => {
			let level = parseInt(heading.localName[1]);
			const headingObject = { heading: heading, group: [] };
			while (level > currentLevel + 1) {
				const empty = { heading: null, group: [] };
				path[currentLevel].push(empty);
				currentLevel += 1;
				path[currentLevel] = empty.group;
			}
			if (level === currentLevel) {
				path[currentLevel - 1].push(headingObject);
				path[currentLevel] = headingObject.group;
			} else if (level < currentLevel) {
				currentLevel = level;
				path[currentLevel - 1].push(headingObject);
				path[currentLevel] = headingObject.group;
			} else if (level === currentLevel + 1) {
				path[currentLevel].push(headingObject);
				currentLevel = level;
				path[currentLevel] = headingObject.group;
			}
		});
		return result;
	}
	static zzz_findVisibleHeading() {
		var headings = this._headings.map(heading => {
			return [heading, heading.getBoundingClientRect().y];
		}).sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = headings.slice(-1)[0];
		headings = headings.filter(heading => heading[1] >= 0);
		return (headings[0] || last)[0];
	}
}
class Hierarchy extends Array {
	constructor(nodeList, level = 0, node = null) {
		super();
		this.level = level;
		this.parent = parent;
		this.node = node;
		this.add(nodeList);
	}
	get label() {
		return this.node?.innerText || "";
	}
	get anchor() {
		if (!this.node) return "";
		if (this.node.id) return this.node.id;
		let id = Utils.findAnchor(this.label);
		let cardinal = 1;
		if (document.getElementById(id)) {
			while (document.getElementById(id + "-" + cardinal)) {
				cardinal++;
			}
			id = id + "-" + cardinal;
		}
		this.node.id = id;
		return id;
	}
	addBacklinks(backlink) {
		if (!backlink) {
			backlink = "";
		}
		if (typeof backlink === "string") {
			let to = backlink;
			backlink = document.createElement("a");
			backlink.href = "#" + to;
			backlink.innerHTML = "🔝";
		}
		this.forEach(item => {
			if (item.node) {
				const a = item.node.appendChild(backlink.cloneNode(true));
			}
			item.addBacklinks(backlink);
		});
		return this;
	}
	addPermalinks() {
		this.forEach(item => {
			if (item.node) {
				item.node.appendChild(item.html_permalink());
			}
			item.addPermalinks();
		});
		return this;
	}
	html_permalink() {
		if (!this.node) return document.createTextNode("");
		const result = document.createElement("a");
		result.href = "#" + this.anchor;
		result.innerHTML = "🔗";
		return result;
	}
	html() {
		if (!this.length) return document.createTextNode("");
		const result = document.createElement("ul");
		this.forEach(item => {
			const li = result.appendChild(document.createElement("li"));
			li.appendChild(item.html_link());
			li.appendChild(item.html());
		});
		return result;
	}
	html_link() {
		if (!this.node) return document.createTextNode("");
		const result = document.createElement("a");
		result.href = "#" + this.anchor;
		result.innerHTML = this.label;
		return result;
	}
	add(nodeList) {
		let node = null;

		while (nodeList.length) {
			let nodeLevel = Toc.getLevel(nodeList[0]);
			if (nodeLevel === this.level) {
				node = nodeList.shift();
				let item = new Hierarchy(nodeList, this.level + 1, node);
				this.push(item);
			} else if (nodeLevel > this.level) {
				let item = new Hierarchy(nodeList, this.level + 1, null);
				this.push(item);
			} else {
				break;
			}
		}
	}
	old_add(nodeList) {
		// return;
		// const headingObject = { heading: node, group: [] };
		// while (nodeLevel > currentLevel + 1) {
		// 	const empty = { heading: null, group: [] };
		// 	path[currentLevel].push(empty);
		// 	currentLevel += 1;
		// 	path[currentLevel] = empty.group;
		// }
		// if (nodeLevel === currentLevel) {
		// 	path[currentLevel - 1].push(headingObject);
		// 	path[currentLevel] = headingObject.group;
		// } else if (nodeLevel < currentLevel) {
		// 	currentLevel = nodeLevel;
		// 	path[currentLevel - 1].push(headingObject);
		// 	path[currentLevel] = headingObject.group;
		// } else if (nodeLevel === currentLevel + 1) {
		// 	path[currentLevel].push(headingObject);
		// 	currentLevel = nodeLevel;
		// 	path[currentLevel] = headingObject.group;
		// }

		return this;
	}
}
class Utils {
	static findVisibleHeading() {
		var headings = this._headings.map(heading => {
			return [heading, heading.getBoundingClientRect().y];
		}).sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = headings.slice(-1)[0];
		headings = headings.filter(heading => heading[1] >= 0);
		return (headings[0] || last)[0];
	}
	static findAnchor(str) {
		if (!str) return `id-${Math.random().toString(36).slice(2, 9)}`;
		if (str instanceof HTMLElement) return this.findAnchor(this.toSlug(str));
		let id = this.toSlug(str);
		let cardinal = 1;
		if (document.getElementById(id)) {
			while (document.getElementById(id + "-" + cardinal)) {
				cardinal++;
			}
			id = id + "-" + cardinal;
		}
		return id;
	}
	static toSlug(str) {
		if (str instanceof HTMLElement) return this.toSlug(str.innerText);
		return str
			.toLowerCase()                 // Convert to lowercase
			.normalize('NFD')              // Normalize to NFD form (decomposes combined characters)
			.replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
			.replace(/[^a-z0-9\s-]/g, '')  // Remove non-alphanumeric characters (except spaces and hyphens)
			.trim()                        // Trim leading/trailing whitespace
			.replace(/\s+/g, '-')          // Replace spaces with hyphens
			.replace(/-+/g, '-');          // Replace multiple hyphens with a single hyphen
	}
}
Toc.init();
