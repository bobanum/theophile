import Webponent from '../Webponent.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import highlight from 'highlight.js/styles/github.css';
import styles from './md.css' assert { type: 'css' };

export class Md extends Webponent {
	static get observedAttributes() { return ['src']; }
	sanitize = DOMPurify(window).sanitize;
	constructor() {
		super();
		this.parser = (marked.parse || marked);
	}

	connectedCallback() {
		this.shadowRoot.appendChild(super.dom.style(highlight));
		this.shadowRoot.appendChild(super.dom.style(styles));
		this.shadowRoot.appendChild(this.dom.main());
	}
	evt = {
		slotchange: e => {
			let content = e.target.assignedNodes().map(e => (e.outerHTML || e.textContent)).join('');
			// this._container.innerHTML = this.parse(content);
			this.appendChild(this.dom.inlineContent(this.parse(content)));
			this.highlight();
		}
	};
	attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'src' && newVal !== oldVal) {
			if (newVal) {
				this.loadFromSrc(newVal);
			}
		}
	}

	loadFromSrc(url) {
		return fetch(url)
			.then(res => res.text())
			.then(content => {
				this.querySelectorAll('[slot="src-content"]').forEach(node => node.remove());
				this.appendChild(this.dom.srcContent(this.parse(content)));
				this.highlight();
			})
			.catch(e => {
				console.error('Md: failed to load src', e);
			});
	}
	parse(markdown) {
		const toHtml = this.parser;
		const dirty = toHtml(markdown);
		return this.sanitize(dirty);
	}

	highlight() {
		if (!this._container) return;
		const blocks = this._container.querySelectorAll('pre code');
		blocks.forEach(block => {
			try {
				hljs.highlightElement(block);
			} catch (e) { /* noop */ }
		});
	}
	dom = {
		main: () => {
			const result = document.createDocumentFragment();
			const styleSlot = document.createElement("slot");
			styleSlot.name = "style";
			styleSlot.addEventListener('slotchange', ({target}) => {
				const assigned = target.assignedNodes();
				assigned.forEach(node => {
					console.log(node);
						
					
					// target.appendChild(node);
				});
			});
			result.appendChild(styleSlot);
			const inlineContentSlot = document.createElement("slot");
			inlineContentSlot.name = "inline-content";
			result.appendChild(inlineContentSlot);
			const srcContentSlot = document.createElement("slot");
			srcContentSlot.name = "src-content";
			result.appendChild(srcContentSlot);
			const slot = document.createElement("slot");
			slot.style.display = "none";
			slot.addEventListener('slotchange', this.evt.slotchange);
			result.appendChild(slot);
			this._container = inlineContentSlot;
			return result;
		},
		inlineContent: (content) => {
			const result = document.createElement("div");
			result.slot = "inline-content";
			result.innerHTML = content;
			return result;
		},
		srcContent: (content) => {
			const result = document.createElement("div");
			result.slot = "src-content";
			result.innerHTML = content;
			return result;
		}
	};
}

Md.register('md');