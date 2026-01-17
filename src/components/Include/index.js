import Webponent from "../Webponent.js";

export class Include extends Webponent {
	connectedCallback() {
		this.shadowRoot.appendChild(this.dom.main());
	}
	static properties = {
		href: {
			type: "String",
			set: function (value) {
				this._.href = value;
				fetch(value).then(response => response.text()).then(text => {
					const doc = this.parseHTML(text);
					this.innerHTML = '';
					this.head.innerHTML = '';
					
					const styles = doc.head.querySelectorAll('style, link[rel="stylesheet"]');
					styles.forEach(style => {
						this.head.appendChild(style);
					});
					while (doc.body.firstChild) {
						this.appendChild(doc.body.firstChild);
					}
				});
			}
		}
	};
	dom = {
		main: () => {
			const result = document.createDocumentFragment();
			this.head = document.createElement("slot");
			this.head.name = "head";
			result.appendChild(this.head);
			const slot = document.createElement("slot");
			result.appendChild(slot);
			return result;
		},
	};
}
Include.register('include');
