export default class Toc extends HTMLElement {
	static observedAttributes = [];
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._href = null;
	}

	connectedCallback() {
		this.shadowRoot.appendChild(this.DOM.main());
		this._headings = Array.from(document.body.querySelectorAll('h1,h2,h3'));
		const hierarchy = this.getHierarchy(this._headings);
		const list = this.DOM.ul(hierarchy);
		list.slot = "list";
		const toplink = this.DOM.toplink();
		this._headings.forEach(heading => {
			heading.appendChild(this.DOM.permalink(heading));
			heading.appendChild(toplink.cloneNode(true));
		});
		this.appendChild(list);
	}
	attributeChangedCallback(name, oldValue, newValue) {
	}
	findId(txt) {
		const id = this.text2slug(txt);

		if (!document.getElementById(id)) {
			return id;
		}
		let number = 2;
		while (document.getElementById(id + "-" + number)) {
			number += 1;
		}
		return id + "-" + number;
	}
	getHierarchy(nodeList) {
		const result = [];
		var currentLevel = 0;
		const path = [result];
		nodeList.forEach(heading => {
			if (!heading.id) {
				heading.id = this.findId(heading.innerText);
			}
			let level = parseInt(heading.tagName[1]);
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
	text2slug(text) {
		const slug = text.toLowerCase()
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		return slug;
	}
	DOM = {
		main: () => {
			const result = document.createElement("nav");
			result.classList.add("th-toc");
			const slotHeader = result.appendChild(document.createElement("slot"));
			slotHeader.name = "header";
			const slotList = result.appendChild(document.createElement("slot"));
			slotList.name = "list";
			return result;
		},
		ul: (group, level = 1) => {
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
					li.appendChild(this.DOM.ul(headingObject.group, level + 1));
				}
			});
			return result;
		},
		permalink: (heading) => {
			const permalink = document.createElement("a");
			const url = new URL(location);
			url.hash = heading.id;
			permalink.href = url.href;
			permalink.classList.add("th-toc-permalink");
			permalink.innerHTML = "&#x1f517;";
			return permalink;
		},
		toplink: () => {
			const result = document.createElement("a");
			result.classList.add("th-toc-toplink");
			const url = new URL(location);
			url.hash = "";
			url.search = "";
			result.href = url.href;			
			result.innerHTML = "&#x21b8;";
			return result;
		},

	};
}
customElements.define('th-toc', Toc);