export default class Theophile {
	static async prepare() {
		await new Promise((resolve) => {
			if (document.readyState === "complete" || document.readyState === "interactive") return resolve();
			window.addEventListener("DomContentLoaded", (e) => {
				console.log("DomContent Loaded in prepare");
				this.ready = true;
				resolve();
			});
		});
		console.log("Theophile ready");
		const promises = Array.from(Object.values(this.plugins), (plugin) =>
			plugin.prepare()
		);
		const data = await Promise.all(promises);
		console.log("Plugins ready");
		return data;
	}
	static processHeadings() {
		var headings = document.querySelectorAll(this.headings);
		headings.forEach((heading) => {
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
	static async mount() {
		this.processHeadings();
		// await new Promise(resolve => {
		//     resolve();
		// });
		console.log("Theophile mounted");
		const promises = Array.from(Object.values(this.plugins), (plugin) =>
			plugin.mount()
		);
		const data = await Promise.all(promises);
		console.log("Plugins mounted");
		return data;
	}
	static async clean() {
		console.log("Theophile cleaned");
		const promises = Array.from(Object.values(this.plugins), (plugin) =>
			plugin.clean()
		);
		const data = await Promise.all(promises);
		console.log("Plugins cleaned");
		return data;
	}
	static cssLink(name) {
		name = name || this.name.toLowerCase();
		var pathname = import.meta.url.slice(0, -15); // 15 = "js/Theophile.js"
		pathname += "css/" + name + ".css";
		const link = document.head.appendChild(document.createElement("link"));
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", pathname);
		return link;
	}
	static async init(root = "./") {
		this.root = root.replace(/\/*$/, "");
		this.loaded = false;
		this.headings = "h1, h2, h3";
		this.ready = false;
		this.plugins = {};
		window.addEventListener("DOMContentLoaded", (e) => {
			console.log("DOMContent loaded");
		});
		this.cssLink();

		await Promise.all(
			["Template", "Reference", "Slide", "Toc"].map((file) =>
				import(`./plugins/${file}/${file}.js`)
			)
		).then((data) => {
			data.forEach((obj) => {
				console.log(`Plugin ${obj.default.name} loaded`);
				this[obj.default.name] = obj.default;
				this.plugins[obj.default.name] = obj.default;
				obj.default.Theophile = Theophile;
			});
		});
		await this.prepare();
		await this.mount();
		await this.clean();
	}
}
