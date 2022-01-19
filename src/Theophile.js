export default class Theophile {
	static get root() {
		return this._root;
	}
	static set root(val) {
		if (val.match(/^[a-zA-Z0-9]+:\/\//)) {
			return (this._root = new URL(val));
		}
		var result = new URL(location);
		if (val[0] === "/") {
			result.pathname = val.replace(/\/*$/, "/");
		} else {
			var path = result.pathname.split("/").slice(0, -1);
			path.push(val);
			result.pathname = path.join("/");
		}
		return (this._root = result);
	}
	static siteURL(url) {
		if (url.match(/^[a-zA-Z0-9]+:\/\//)) {
			return new URL(url);
		}
		var result = new URL(this.root);
		if (url[0] === "/") {
			result.pathname = url;
			return result;
		}
		result.pathname += url;
		return result;
	}
	static processHeadings() {
		var headings = document.querySelectorAll(this.headings);
		headings.forEach(heading => {
			if (heading.hasAttribute("id")) {
				return;
			}
			var str = heading.textContent;
			str = this.normalizeString(str);
			str = str.slice(0, 128);
			if (!document.getElementById(str)) {
				heading.setAttribute("id", str);
				return;
			}
			var n = 2;
			while (document.getElementById(str + "-" + n)) {
				n += 1;
			}
			heading.setAttribute("id", str + "-" + n);
		});
	}
	static normalizeString(str) {
		var result = str
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9_\.\-]/g, "_")
			.replace(/_+/g, "_");
		return result;
	}
	static async prepare(options = {}) {
		for (let property in options) {
			this[property] = options[property];
		}
		for (let property in this.config) {
			this[property] = this.config[property];
		}

		await new Promise(resolve => {
			if (
				document.readyState === "complete" ||
				document.readyState === "interactive"
			)
				return resolve();
			window.addEventListener("DomContentLoaded", e => {
				console.trace("DomContent Loaded in prepare");
				this.ready = true;
				resolve();
			});
		});
		console.trace("Theophile ready");
		const promises = Array.from(Object.values(this.plugins), plugin =>
			plugin.prepare()
		);
		const data = await Promise.all(promises);
		console.trace("Plugins ready");
		return data;
	}
	static async process() {
		this.processHeadings();
		console.trace("Theophile processed");
		const promises = Array.from(Object.values(this.plugins), plugin =>
			plugin.process()
		);
		const data = await Promise.all(promises);
		console.trace("Plugins processed");
		return data;
	}
	static async mount() {
		this.processHeadings();
		console.trace("Theophile mounted");
		const promises = Array.from(Object.values(this.plugins), plugin =>
			plugin.mount()
		);
		const data = await Promise.all(promises);
		console.trace("Plugins mounted");
		return data;
	}
	static async clean() {
		console.trace("Theophile cleaned");
		const promises = Array.from(Object.values(this.plugins), plugin =>
			plugin.clean()
		);
		const data = await Promise.all(promises);
		console.trace("Plugins cleaned");
		return data;
	}
	static appURL(file) {
		var url = new URL(import.meta.url);
		var path = url.pathname.split("/").slice(0, -2);
		if (file) {
			path.push(file);
		}
		url.pathname = path.join("/");
		return url;
	}
	static cssLink() {
		var url = this.appURL("src/css/style.css");
		const link = document.head.appendChild(document.createElement("link"));
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", url);
		return link;
	}
	static async loadPlugin(name) {
		const obj = await import(`./plugins/${name}/${name}.js`);
		const plugin = obj.default;
		console.trace(`Plugin ${plugin.name} loaded`);
		this[plugin.name] = plugin;
		this.plugins[plugin.name] = plugin;
		return plugin.init(this);
	}
	static loadJson(url) {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open("get", url);
			xhr.responseType = "json";
			xhr.addEventListener("load", e => {
				if (e.target.status === 404) {
					return reject(e.target.statusText);
				}
				return resolve(e.target.response);
			});
			xhr.addEventListener("error", e => {
				reject(e.target);
			});
			xhr.onerror = function () {
				console.error("XHR error " + xhr.status);
			};
			xhr.upload.onloadstart = function () {
				console.log("onloadstart" + xhr.status);
			};
			xhr.upload.onloadend = function () {
				console.log("onloadend" + xhr.status);
			};
			xhr.upload.onerror = function () {
				console.log("error" + xhr.status);
			};
			try {
				xhr.send(null);
			} catch (err) {
				reject(err);
			}
		});
	}
	static async loadConfig() {
		var data;
		try {
			data = await this.loadJson(this.siteURL("theophile.json"));
		} catch (err) {
			data = {};
		}

		this.config = data;
		return data;
	}
	static init(root = ".") {
		if (this.loaded) {
			return Promise.resolve();
		}
		this.loaded = true;
		this._root = "";
		this.root = root;
		this.headings = "h1, h2, h3";
		this.ready = false;
		this.plugins = {};
		this.cssLink();

		const plugins = ["Template", "Reference", "Slide", "Toc"];
		const promises = plugins.map(async file => {
			return this.loadPlugin(file);
		});
		promises.push(this.loadConfig());
		return Promise.all(promises);
	}
	static async exec(options = {}) {
		if (typeof options === "string") {
			options = { root: options };
		}
		await this.init(options.root);
		delete options.root;
		await this.prepare(options);
		await this.process();
		await this.mount();
		await this.clean();
	}
}
