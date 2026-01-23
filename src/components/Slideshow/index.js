import Webponent from "../Webponent.js";
import styles from './style.css';
import navigation from './navigation.css';
export * from './Slide.js';

export class Slideshow extends Webponent {
	connectedCallback() {
		this.shadowRoot.appendChild(super.dom.style(styles));
		this.shadowRoot.appendChild(super.dom.style(navigation));
		this.shadowRoot.appendChild(document.createElement("slot"));
		this.shadowRoot.appendChild(this.dom.navigation());
	}
	dom = {
		backdrop: (navigation = true) => {
			const result = document.createElement("div");
			result.classList.add("backdrop");
			result.tabIndex = "0";
			if (navigation) {
				result.appendChild(this.dom.navigation());
				this.addKeydownEvents(result);
				this.addTouchEvents(result);
			}
			const config = { attributes: false, childList: true, subtree: false };
			const callback = (mutationsList, _observer) => {
				const mutations = mutationsList.filter(mutation => mutation.addedNodes.length > 0);
				var slides = mutations.reduce((compil, mutation) => {
					compil.push(...Array.from(mutation.addedNodes).filter(node => node.matches(".th-slide")));
					return compil;
				}, []);
				if (slides.length) {
					slides[0].querySelector("footer").appendChild(this.dom.status());
				}
			};
			const observer = new MutationObserver(callback);
			observer.observe(result, config);
			result.Slide = this;
			return result;
		},
		navigation: () => {
			const navigation = document.createElement("div");
			navigation.classList.add("navigation");
			const previous = navigation.appendChild(document.createElement("div"));
			previous.classList.add("previous");
			previous.addEventListener("click", _e => this.showPrevious());
			const next = navigation.appendChild(document.createElement("div"));
			next.classList.add("next");
			next.addEventListener("click", _e => this.showNext());
			const first = navigation.appendChild(document.createElement("div"));
			first.classList.add("first");
			first.addEventListener("click", _e => this.showFirst());
			const last = navigation.appendChild(document.createElement("div"));
			last.classList.add("last");
			last.addEventListener("click", _e => this.showLast());
			navigation.appendChild(this.dom.options());
			return navigation;
		},
		options: () => {
			const options = document.createElement("div");
			options.classList.add("options");
			var menu = options.appendChild(document.createElement("span"));
			menu.classList.add("th-option-menu");
			var contactsheet = options.appendChild(document.createElement("span"));
			contactsheet.classList.add("th-option-contactsheet");
			contactsheet.addEventListener("click", _e => {
				this.showContactsheet();
			});
			var slideshow = options.appendChild(document.createElement("span"));
			slideshow.classList.add("th-option-slideshow");
			var continous = options.appendChild(document.createElement("span"));
			continous.classList.add("th-option-continous");
			var print = options.appendChild(document.createElement("span"));
			print.classList.add("th-option-print");
			var stop = options.appendChild(document.createElement("span"));
			stop.classList.add("th-option-stopslideshow");
			stop.addEventListener("click", _e => {
				this.stopSlideshow();
			});
			return options;
		},
		contactsheet: () => {
			if (this._contactsheet) return this._contactsheet;
			const contactsheet = document.createElement("div");
			contactsheet.id = "th-contactsheet";
			contactsheet.addEventListener("click", e => {
				if (e.target === e.currentTarget) {
					this.hideContactsheet();
				}
			});
			const btnExit = contactsheet.appendChild(document.createElement("span"));
			btnExit.classList.add("th-contactsheet-exit-btn");
			btnExit.addEventListener("click", _e => {
				this.hideContactsheet();
			});
			const container = contactsheet.appendChild(document.createElement("div"));
			container.classList.add("th-contactsheet-container");
			const grid = container.appendChild(document.createElement("div"));
			grid.classList.add("th-contactsheet-grid");
			this.slides.forEach(slide => {
				grid.appendChild(slide.contactsheetThumbnail);
			});
			grid.tabIndex = "0";
			grid.addEventListener("keydown", e => {
				// e.preventDefault();
				// e.stopPropagation();
				if (e.key === "Control" || e.key === "Alt" || e.key === "Shift" || e.key === "Meta") return;
				var prefix = "";
				if (e.altKey) prefix += "Alt-";
				if (e.ctrlKey || e.metaKey) prefix += "Ctrl-";
				if (e.shiftKey) prefix += "Shift-";
				var key = prefix + e.key;
				// var code = prefix + e.code;
				var stop = false;
				switch (key) {
					case "ArrowLeft":
					case "PageUp":
					case "Shift-Tab": {
						stop = true;
						let previous = this.contactsheetCurrent.previous;
						if (previous) {
							this.highlightThumbnail(previous);
						}
						break;
					}
					case "ArrowDown": {
						stop = true;
						this.contactsheetCurrent.contactsheetThumbnail.classList.remove("th-contactsheet-current");
						let pos = Math.round(this.contactsheetCurrent.contactsheetThumbnail.getBoundingClientRect().x);
						let next = this.contactsheetCurrent;
						while (next.next) {
							next = next.next;
							if (pos === Math.round(next.contactsheetThumbnail.getBoundingClientRect().x)) {
								break;
							}
						}
						this.highlightThumbnail(next);
						break;
					}
					case "ArrowUp": {
						stop = true;
						this.contactsheetCurrent.contactsheetThumbnail.classList.remove("th-contactsheet-current");
						let pos = Math.round(this.contactsheetCurrent.contactsheetThumbnail.getBoundingClientRect().x);
						let previous = this.contactsheetCurrent;
						while (previous.previous) {
							previous = previous.previous;
							if (pos === Math.round(previous.contactsheetThumbnail.getBoundingClientRect().x)) {
								break;
							}
						}
						this.highlightThumbnail(previous);
						break;
					}
					case "ArrowRight":
					case "PageDown": {
						stop = true;
						let next = this.contactsheetCurrent.next;
						if (next) {
							this.highlightThumbnail(next);
						}
						break;
					}
					case "Home": {
						stop = true;
						this.highlightThumbnail(this.slides[0]);
						break;
					}
					case "End": {
						stop = true;
						this.highlightThumbnail(this.slides.slice(-1)[0]);
						break;
					}
					case "Tab":
					case "Enter": {
						stop = true;
						this.hideContactsheet(this.contactsheetCurrent);
						break;
					}
					case "Escape":
					case "#": {
						stop = true;
						this.hideContactsheet();
						break;
					}
				}
				if (stop) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
			this._contactsheet = contactsheet;
			return contactsheet;
		},
		clock: () => {
			var result = document.createElement("div");
			result.classList.add("clock");
			var update = () => {
				var time = new Date();
				result.innerHTML = time.toTimeString().split(" ")[0].slice(0, -3);
			};
			setInterval(update, 1000);
			update();
			return result;
		},
		timeSlide: () => {
			var result = document.createElement("div");
			result.classList.add("time");
			var update = () => {
				var time = new Date(new Date().getTime() - this.timestampSlide + new Date().getTimezoneOffset() * 60000);
				result.innerHTML = time.toTimeString().split(" ")[0].slice(3);
			};
			setInterval(update, 1000);
			return result;
		},
		timeSlideshow: () => {
			var result = document.createElement("div");
			result.classList.add("th-slideshow-time");
			var update = () => {
				var time = new Date(new Date().getTime() - this.timestamp + new Date().getTimezoneOffset() * 60000);
				result.innerHTML = time.toTimeString().split(" ")[0].slice(3);
			};
			setInterval(update, 1000);
			update();
			return result;
		},
	};

}
Slideshow.register("slideshow");