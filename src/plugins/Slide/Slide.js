import Plugin from "../Plugin.js";
import Transition from "../../transitions/Transition.js";
/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Slide extends Plugin {
	/**
	 * Creates an instance of Slide.
	 * @memberof Slide
	 */
	constructor() {
		super();
		/**
		 * id of the slide
		 */
		this.id = "";
		/**
		 * Previous Slide
		 * @type Slide
		 */
		this.previous = null;
		/**
		 * Next Slide
		 * @type Slide
		 */
		this.next = null;
		/**
		 * Slide contents without title
		 * @type {HTMLElement[]}
		 */
		this.contents = [];
		/**
		 * Le dom HTML créé pour la slide
		 * @type HTMLElement
		 * @private
		 */
		this._html = null;
		this.idx = this.constructor.slides.length;
		this.constructor.slides.push(this);
	}
	/**
	 *
	 *
	 * @readonly
	 * @memberof Slide
	 */
	get first() {
		if (!this.previous) return this;
		return this.previous.first;
	}
	get last() {
		if (!this.next) return this;
		return this.next.last;
	}
	get html() {
		if (!this._html) {
			this._html = this.html_create();
		}
		return this._html;
	}
	html_create() {
		const html = document.createElement("div");
		html.classList.add("th-slide");
		html.appendChild(this.html_header());
		html.appendChild(this.html_footer());
		html.appendChild(this.html_body());
		html.obj = this;
		return html;
	}
	html_body() {
		const body = document.createElement("div");
		body.classList.add("th-slide-body");
		this.contents.forEach(content => {
			body.appendChild(content.cloneNode(true));
		});
		return body;
	}
	static html_backdrop() {
		const backdrop = document.createElement("div");
		backdrop.classList.add("th-slide-backdrop");
		const navigation = backdrop.appendChild(document.createElement("div"));
		navigation.classList.add("th-slide-navigation");
		const previous = navigation.appendChild(document.createElement("div"));
		previous.classList.add("th-slide-previous");
		previous.addEventListener("click", e => this.showPrevious());
		const next = navigation.appendChild(document.createElement("div"));
		next.classList.add("th-slide-next");
		next.addEventListener("click", e => this.showNext());
		const first = navigation.appendChild(document.createElement("div"));
		first.classList.add("th-slide-first");
		first.addEventListener("click", e => this.showFirst());
		const last = navigation.appendChild(document.createElement("div"));
		last.classList.add("th-slide-last");
		last.addEventListener("click", e => this.showLast());
		navigation.appendChild(this.html_options());
		this.addKeydownEvents(backdrop);
		backdrop.Slide = this;
		return backdrop;
	}
	static html_options() {
		const options = document.createElement("div");
		options.classList.add("th-slide-options");
		var menu = options.appendChild(document.createElement("span"));
		menu.classList.add("th-option-menu");
		var contactsheet = options.appendChild(document.createElement("span"));
		contactsheet.classList.add("th-option-contactsheet");
		var slideshow = options.appendChild(document.createElement("span"));
		slideshow.classList.add("th-option-slideshow");
		var continous = options.appendChild(document.createElement("span"));
		continous.classList.add("th-option-continous");
		var print = options.appendChild(document.createElement("span"));
		print.classList.add("th-option-print");
		var stop = options.appendChild(document.createElement("span"));
		stop.classList.add("th-option-stopslideshow");
		stop.addEventListener("click", e => {
			this.stopSlideshow();
		});
		return options;
	}
	static addKeydownEvents(backdrop) {
		backdrop.tabIndex = "0";
		backdrop.addEventListener("keydown", e => {
			if (
				e.key === "Control" ||
				e.key === "Alt" ||
				e.key === "Shift" ||
				e.key === "Meta"
			) {
				return;
			}
			var prefix = "";
			if (e.altKey) prefix += "Alt-";
			if (e.ctrlKey || e.metaKey) prefix += "Ctrl-";
			if (e.shiftKey) prefix += "Shift-";
			var key = prefix + e.key;
			// var code = prefix + e.code;
			// console.log(key);
			switch (key) {
				case "ArrowRight":
				case "ArrowDown":
				case "PageDown":
				case "+":
				case "Enter":
					this.showNext();
					break;
				case "ArrowLeft":
				case "ArrowUp":
				case "PageUp":
				case "-":
					this.showPrevious();
					break;
				case "Home":
					this.showFirst();
					break;
				case "End":
					this.showLast();
					break;
				case " ":
				case "Escape":
					e.preventDefault();
					if (Object.values(this.animations).length > 0) {
						this.cancelAnimations();
					} else {
						this.stopSlideshow();
					}
			}
			e.stopPropagation();
		});
	}
	static async showSlide(slide) {
		if (slide === this.backdrop.slide) return;
		if (!slide.zoom) {
			slide.ajustZoom();
		}
		// await Promise.all(Object.values(this.animations));
		var transition = new Transition[this.transition](
			this.backdrop.slide,
			slide
		);
		transition.reverse = slide.idx < this.backdrop.slide.idx;
		transition.options = this.transitionOptions;
		transition.duration = this.transitionDuration;
		transition.go().then(data => {
			this.backdrop.slide = slide;
		});
	}
	static async cancelAnimations() {
		Object.values(this.animations).forEach(animation => animation.cancel());
		return await Promise.all(
			Object.values(this.animations).map(animation => animation.promise)
		);
	}
	static async waitTransitions(cancel = true) {
		if (cancel) {
			Object.values(this.animations).forEach(animation =>
				animation.cancel()
			);
		}
		return Promise.all(
			Object.values(this.animations).map(animation => animation.promise)
		);
	}
	static async showNext(n = 1) {
		await this.waitTransitions();
		var slide = this.backdrop.slide;
		while (n > 0 && slide.next) {
			slide = slide.next;
			n -= 1;
		}
		this.showSlide(slide);
	}
	static async showPrevious(n = 1) {
		await this.waitTransitions();
		var slide = this.backdrop.slide;
		while (n > 0 && slide.previous) {
			slide = slide.previous;
			n -= 1;
		}
		this.showSlide(slide);
	}
	static async showLast() {
		await this.waitTransitions();
		var slide = this.backdrop.slide.last;
		this.showSlide(slide);
	}
	static async showFirst() {
		await this.waitTransitions();
		var slide = this.backdrop.slide.first;
		this.showSlide(slide);
	}
	html_header() {
		var ptr = this;
		if (ptr.continued) {
			while (!ptr.heading && ptr.previous) {
				ptr = ptr.previous;
			}
		}
		if (!ptr.heading) {
			return document.createTextNode("");
		}
		const result = document.createElement("header");
		result.appendChild(ptr.heading.cloneNode(true));
		if (this.continued) {
			result.append("...suite");
		}
		return result;
	}
	html_footer() {
		const result = document.createElement("footer");
		result.innerHTML = "&copy; 2038 My pretty course";
		return result;
	}
	/**
	 *
	 *
	 * @static
	 * @returns
	 * @memberof Slide
	 */
	static addElement(slide, element) {
		if (!slide && element.nodeType === 3) {
			if (element.textContent.trim() === "") {
				return slide;
			} else {
				slide = new this();
				element.slide = slide;
			}
		}
		if (element.nodeType === 3) {
			slide.contents.push(element);
			return slide;
		}
		if (element.nodeType !== 1) {
			return slide;
		}
		if (element.matches("h1,h2")) {
			if (element.matches("h1+h2")) {
				slide.contents.push(element);
				return slide;
			}
			if (slide) {
				slide.next = new this();
				slide.next.previous = slide;
				slide = slide.next;
			} else {
				slide = new this();
			}
			element.slide = slide;
			slide.trigger = element;
			slide.heading = element;
			slide.id = element.getAttribute("id");
			return slide;
		}
		if (element.matches("br")) {
			if (slide) {
				slide.next = new this();
				slide.next.previous = slide;
				slide = slide.next;
			} else {
				slide = new this();
			}
			element.slide = slide;
			slide.trigger = element;
			slide.continued = true;
			return slide;
		}
		if (!slide) {
			slide = new this();
			element.slide = slide;
		}
		slide.contents.push(element);
		return slide;
	}
	static html_contactsheet() {
		if (this.contactsheet) return this.contactsheet;
		var contactsheet = document.createElement("section");
		contactsheet.classList.add("th-contactsheet");
		var slide = this.first;
		while (slide) {
			contactsheet.appendChild(slide.html.cloneNode(true));
			slide = slide.next;
		}
		contactsheet.obj = this;
		this.contactsheet = contactsheet;
		return this.contactsheet;
	}
	static async prepare() {
		await super.prepare();
		document.body.querySelectorAll("script").forEach(script => {
			if (script.innerHTML.indexOf("For SVG support") >= 0) {
				script.remove();
			}
		});
	}
	static async process() {
		await super.process();
		document.documentElement.style.setProperty(
			"--th-slide-nlines",
			this.nlines
		);
		document.documentElement.style.setProperty(
			"--th-slide-ratio",
			this.ratio
		);
		var style = document.head.appendChild(document.createElement("style"));
		style.media = `(min-aspect-ratio: ${this.ratio} / 1)`;
		style.innerHTML =
			".th-slide {--font-size: calc(100vh / var(--th-slide-nlines));}";
		var slide;
		var ptr = document.body.firstChild;
		while (ptr) {
			slide = this.addElement(slide, ptr);
			ptr = ptr.nextSibling;
		}
		this.first = slide.first;
		// document.body.insertBefore(this.html_contactsheet(), document.body.firstChild);
		// slide = slide.first;
		// while(slide) {
		//     document.body.appendChild(slide.html);
		//     slide = slide.next;
		// }
		return this.slides;
	}
	static get state() {
		return document.body.classList.contains("th-slideshow");
	}
	static findVisibleSlide() {
		var triggers = this.slides
			.map(slide => {
				return [slide, slide.trigger.getBoundingClientRect().y];
			})
			.sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = triggers.slice(-1)[0];
		triggers = triggers.filter(trigger => trigger[1] >= 0);
		return (triggers[0] || last)[0];
	}
	ajustZoom() {
		var backdrop = document.body.appendChild(
			this.constructor.html_backdrop()
		);
		backdrop.appendChild(this.html);
		var body = this.html.querySelector(".th-slide-body");
		body.style.position = "relative";
		var relativeRect = body.getBoundingClientRect();
		body.style.position = "absolute";
		var absoluteRect = body.getBoundingClientRect();
		body.style.removeProperty("position");
		if (relativeRect.width === absoluteRect.width) {
			var zoom = 1;
			body.style.alignSelf = "start";
			body.style.overflow = "hidden";
			if (body.scrollHeight < relativeRect.height) {
				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.05;
					body.style.fontSize = zoom + "em";
				}
				while (body.scrollHeight > relativeRect.height) {
					zoom -= 0.01;
					body.style.fontSize = zoom + "em";
				}
			} else {
				while (body.scrollHeight > relativeRect.height) {
					zoom -= 0.05;
					body.style.fontSize = zoom + "em";
				}

				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.01;
					body.style.fontSize = zoom + "em";
				}
				zoom -= 0.01;
			}
			body.style.removeProperty("align-self");
			body.style.removeProperty("overflow");
		} else {
			zoom = Math.min(
				relativeRect.width / absoluteRect.width,
				relativeRect.height / absoluteRect.height
			);
		}
		body.style.fontSize = zoom + "em";
		this.zoom = zoom;
		backdrop.remove();
		return this;
	}
	static startSlideshow(state = true) {
		if (state) {
			const slide = this.findVisibleSlide();
			if (!slide.zoom) {
				slide.ajustZoom();
			}
			localStorage.slideshow = "true";
			document.body.classList.add("th-slideshow");
			this.backdrop = document.body.appendChild(this.html_backdrop());
			this.backdrop.slide = slide;
			this.backdrop.appendChild(this.backdrop.slide.html);
			setTimeout(() => {
				this.backdrop.focus();
				return;
			}, 1000);
		} else {
			return this.stopSlideshow();
		}
		return this;
	}
	static stopSlideshow() {
		document.body.classList.remove("th-slideshow");
		var pos = this.backdrop.slide.trigger.offsetTop;
		window.scroll(0, pos - 10);
		this.backdrop.remove();
		delete this.backdrop;
		localStorage.slideshow = "false";
	}
	static async clean() {
		super.clean();
		window.addEventListener("keydown", e => {
			if (
				e.key === "Shift" ||
				e.key === "Control" ||
				e.key === "Alt" ||
				e.key === "Meta"
			)
				return;
			if (e.code === "Space") {
				// var visible = this.getVisible();
				e.stopPropagation();
				e.preventDefault();
				this.startSlideshow();
				return false;
			}
		});
		document.querySelectorAll(".th-slide-start").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				this.startSlideshow();
			});
		});
		if (localStorage.slideshow === "true") {
			setTimeout(() => {
				this.startSlideshow();
			}, 100);
		}
	}
	static defineProperties() {
		Object.defineProperties(this.Theophile, {
			"nlines": {
				get: () => {
					return this.nlines;
				},
				set: value => {
					this.nlines = value;
				},
			},
			"ratio": {
				get: () => {
					return this.ratio;
				},
				set: value => {
					if (value instanceof Array) {
						value = value[0] / value[1];
					}
					this.ratio = value;
				},
			},
			"transition": {
				get: () => {
					return this.transition;
				},
				set: value => {
					this.transition = value[0].toUpperCase() + value.slice(1);
				},
			},
			"transition-duration": {
				get: () => {
					return this.transitionDuration;
				},
				set: value => {
					this.transitionDuration = value;
				},
			},
			"transitionDuration": {
				get: () => {
					return this.transitionDuration;
				},
				set: value => {
					this.transitionDuration = value;
				},
			},
			"transition-options": {
				get: () => {
					return this.transitionOptions;
				},
				set: value => {
					this.transitionOptions = value;
				},
			},
		});
	}
	static init(Theophile) {
		super.init(Theophile);
		this.nlines = 20;
		this.ratio = 16 / 9;
		this.transition = "Fade";
		this.transitionDuration = 500;
		this.transitionOptions = {};
		this.defineProperties();
		this.contactsheet = null;
		this.slides = [];
		this.animations = {};
	}
}
