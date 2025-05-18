/**
 * TheophileElement is a base class for custom elements, providing utility methods for attribute management,
 * URL rebasing, HTML/CSS processing, and asynchronous loading of external resources.
 * 
 * @extends HTMLElement
 * 
 * @property {string} static prefix - The prefix used for custom element tag names.
 * @property {TaskList} static _tasks - A static TaskList instance for managing asynchronous tasks.
 * @property {object} static DOM - Utility methods for DOM manipulation (link, slot).
 * @property {object} static meta - Metadata for the element, set during initialization.
 * @property {string} static tagName - The custom element's tag name, set during initialization.
 * 
 * @method static defineAttributes
 *   Defines properties as attributes on the element's prototype.
 *   @param {object} properties - Properties to define.
 *   @returns {string[]} - Array of property names defined.
 * 
 * @constructor
 *   Attaches an open shadow root to the element.
 * 
 * @method attributeChangedCallback
 *   Handles attribute changes and updates the corresponding property.
 *   @param {string} name - The name of the changed attribute.
 *   @param {string|null} oldValue - The old value of the attribute.
 *   @param {string|null} newValue - The new value of the attribute.
 * 
 * @method rebaseURL
 *   Rebases a URL relative to a base, with security checks for unsafe URLs.
 *   @param {string} url - The URL to rebase.
 *   @param {string} [base=this._href] - The base URL.
 *   @returns {string} - The rebased URL or the original if unsafe.
 * 
 * @method cleanup
 *   Removes injected live-server code from HTML.
 *   @param {string} html - The HTML string to clean.
 *   @returns {string} - Cleaned HTML.
 * 
 * @method excludeText
 *   Excludes text between start and end markers.
 *   @param {string} text - The text to process.
 *   @param {string} start - The start marker.
 *   @param {string} end - The end marker.
 *   @returns {string} - Text with excluded section removed.
 * 
 * @method rebaseHtmlUrls
 *   Rebases all relevant HTML attribute URLs in a string.
 *   @param {string} html - The HTML string to process.
 *   @returns {string} - HTML with rebased URLs.
 * 
 * @method rebaseCssUrls
 *   Rebases all CSS url() references in a string.
 *   @param {string} html - The HTML string to process.
 *   @returns {string} - HTML with rebased CSS URLs.
 * 
 * @method load
 *   Asynchronously loads and processes an HTML file, dispatching a "load" event.
 *   @param {string} url - The URL to load.
 *   @returns {Promise<Document|undefined>} - The loaded HTML document or undefined on error.
 * 
 * @method static wrap
 *   Wraps a DOM node or NodeList with a wrapper element.
 *   @param {Node|NodeList} content - The content to wrap.
 *   @param {string|Element} wrapper - The wrapper element or tag name.
 *   @returns {Element} - The wrapper element containing the content.
 * 
 * @method static addTask
 *   Adds a task to the static TaskList.
 *   @param {Function|Promise} task - The task to add.
 *   @returns {typeof TheophileElement} - The class itself for chaining.
 * 
 * @method static ready
 *   Waits for all tasks in the static TaskList to complete.
 *   @returns {Promise} - Resolves when all tasks are complete.
 * 
 * @method static addStyle
 *   Adds a stylesheet link to the document head.
 *   @param {string} url - The URL of the stylesheet.
 *   @returns {typeof TheophileElement} - The class itself for chaining.
 * 
 * @method static init
 *   Initializes the element with metadata and defines the custom element.
 *   @param {object} meta - Metadata for the element.
 *   @param {string} [tagName] - Optional custom tag name.
 *   @returns {typeof TheophileElement} - The class itself for chaining.
 */
import TaskList from "./TaskList.js";

export default class TheophileElement extends HTMLElement {
	/**
	 * @type {string}
	 * @static
	 */
	static prefix = "th";
	static _tasks = new TaskList();
	/**
	 * Creates an instance of the custom element and attaches an open shadow DOM.
	 * Calls the parent class constructor.
	 */
	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
	}
	/**
	 * Called when one of the element's observed attributes is changed.
	 * Updates the corresponding property on the instance if the new value differs from the old value.
	 *
	 * @param {string} name - The name of the changed attribute.
	 * @param {string|null} oldValue - The previous value of the attribute.
	 * @param {string|null} newValue - The new value of the attribute.
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}
		this[name] = newValue;
	}
	/**
	 * Defines properties with descriptors on the prototype of the class and returns the property names.
	 *
	 * @param {Object<string, PropertyDescriptor>} properties - An object whose keys are property names and values are property descriptors.
	 * @returns {string[]} An array of the property names that were defined.
	 */
	static defineAttributes(properties) {
		Object.defineProperties(this.prototype, properties);
		return Object.keys(properties);
	}
	/**
	 * Resolves a given URL relative to a base URL, returning the absolute URL.
	 * If the URL contains unsafe characters or starts with "javascript:" or "data:", it is returned as-is.
	 *
	 * @param {string} url - The URL to resolve.
	 * @param {string} [base=this._href] - The base URL to resolve against. Defaults to the instance's `_href` property.
	 * @returns {string} The resolved absolute URL, or the original URL if it is unsafe or cannot be resolved.
	 */
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
	/**
	 * Removes the section of HTML code injected by live-server, delimited by the specified start and end markers.
	 *
	 * @param {string} html - The HTML string to clean up.
	 * @returns {string} The cleaned HTML string with the injected code removed.
	 */
	cleanup(html) {
		const start = "<!-- Code injected by live-server -->";
		const end = "</script>";
		let result = this.excludeText(html, start, end);
		return result;
	}
	/**
	 * Removes the substring between the first occurrence of the specified start and end markers (inclusive) from the given text.
	 *
	 * @param {string} text - The original string from which to exclude text.
	 * @param {string} start - The starting marker of the substring to exclude.
	 * @param {string} end - The ending marker of the substring to exclude.
	 * @returns {string} The resulting string with the specified substring removed. If the markers are not found, returns the original text.
	 */
	excludeText(text, start, end) {
		const startIndex = text.indexOf(start);
		const endIndex = text.indexOf(end, startIndex + start.length);
		if (startIndex !== -1 && endIndex !== -1) {
			return text.substring(0, startIndex) + text.substring(endIndex + end.length);
		}
		return text;
	}
	/**
	 * Rewrites all relevant HTML attribute URLs in the given HTML string using the `rebaseURL` method.
	 *
	 * This method searches for attributes such as `href`, `src`, `action`, etc., and replaces their values
	 * with the rebased URL as returned by `this.rebaseURL`.
	 *
	 * @param {string} html - The HTML string in which to rebase URLs.
	 * @returns {string} The HTML string with all relevant attribute URLs rebased.
	 */
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
	/**
	 * Rewrites all CSS `url()` references in the provided HTML string using the `rebaseURL` method.
	 *
	 * @param {string} html - The HTML string containing CSS with `url()` references to be rebased.
	 * @returns {string} The HTML string with all CSS `url()` references updated.
	 */
	rebaseCssUrls(html) {
		const r = "url\\(([^\\)]*)\\)";
		const regex = new RegExp(r, "g");
		html = html.replace(regex, (dummy, url) => {
			return `url(${this.rebaseURL(url)})`;
		});
		return html;
	}

	/**
	 * Asynchronously loads HTML content from the specified URL, processes it,
	 * and dispatches a "load" event with the parsed HTML document.
	 *
	 * @async
	 * @param {string} url - The URL to fetch the HTML content from.
	 * @returns {Promise<Document|undefined>} A promise that resolves to the parsed HTML Document,
	 * or undefined if an error occurs.
	 * @fires CustomEvent#load - Dispatched with the parsed template document as detail.
	 */
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
	/**
	 * Wraps a DOM element or a collection of DOM elements with a specified wrapper element.
	 *
	 * @param {Node|NodeList|HTMLCollection} content - The DOM element or collection of elements to be wrapped.
	 * @param {string|Element} wrapper - The tag name of the wrapper element as a string, or an existing DOM element.
	 * @returns {Element} The wrapper element containing the wrapped content.
	 */
	static wrap(content, wrapper) {
		if (typeof wrapper === "string") {
			wrapper = document.createElement(wrapper);
		}
		if (content.length === undefined) {
			content.parentNode.insertBefore(wrapper, content);
			wrapper.appendChild(content);
			return wrapper;
		}
		if (content.length === 0) {
			return wrapper;
		}
		content[0].parentNode.insertBefore(wrapper, content[0]);

		[...content].forEach((child) => {
			wrapper.appendChild(child);
		});

		return wrapper;
	}
	/**
	 * Adds a task to the internal tasks set.
	 *
	 * @param {*} task - The task to add.
	 * @returns {typeof this} The current class for chaining.
	 */
	static addTask(task) {
		this._tasks.add(task);
		return this;
	}
	/**
	 * Returns a promise that resolves when all tasks are complete.
	 * 
	 * @returns {Promise<void>} A promise that resolves when the class's tasks are complete.
	 */
	static ready() {
		return this._tasks.complete();
	}
	/**
	 * A collection of utility methods for creating DOM elements related to custom elements.
	 * @namespace
	 * @property {function(string=): HTMLLinkElement|DocumentFragment} link - 
	 *   Creates a <link> element for a stylesheet with the given URL or the default based on the tag name.
	 *   If a link with the same id already exists, returns an empty DocumentFragment.
	 *   @param {string} [url] - The URL of the stylesheet. Defaults to "<tagName>.css".
	 *   @returns {HTMLLinkElement|DocumentFragment} The created <link> element or an empty fragment if already present.
	 *
	 * @property {function(string=, Node=): HTMLSlotElement} slot - 
	 *   Creates a <slot> element with an optional name and optional content.
	 *   @param {string} [name] - The name of the slot.
	 *   @param {Node} [content] - The content to append to the slot.
	 *   @returns {HTMLSlotElement} The created <slot> element.
	 */
	static DOM = {
		link: function(url) {			
			url = url || this.tagName + ".css";
			let id = this.tagName + "-style";
			if (document.getElementById(id)) {
				return document.createDocumentFragment();
			}
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = new URL(url, this.meta.url).href;
			link.id = id;
			return link;
		},
		slot: function(name, content) {
			const slot = document.createElement("slot");
			if (name) {
				slot.name = name;
			}
			if (content) {
				slot.appendChild(content);
			}
			return slot;
		},
	};
	/**
	 * Adds a stylesheet link element to the document head using the provided URL.
	 *
	 * @param {string} url - The URL of the stylesheet to add.
	 * @returns {typeof TheophileElement} The class itself for method chaining.
	 */
	static addStyle(url) {
		document.head.appendChild(this.DOM.link.call(this, url));
		return this;
	}
	/**
	 * Initializes the custom element by setting its metadata and tag name, then defines it with the Custom Elements API.
	 *
	 * @param {Object} meta - Metadata associated with the custom element.
	 * @param {string} [tagName] - Optional custom tag name for the element. If not provided, a tag name is generated based on the class name.
	 * @returns {typeof TheophileElement} The class itself, allowing for chaining.
	 */
	static init(meta, tagName) {
		this.meta = meta;
		
		this.tagName = tagName || `${this.prefix}${this.name.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
		
		customElements.define(this.tagName, this);
		return this;
	}
}
