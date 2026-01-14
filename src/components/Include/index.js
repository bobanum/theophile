import Webponent from "../Webponent.js";

export class Include extends Webponent {
	constructor() {
		super();
		console.log(this);
		
	}
	connectedCallback() {
		console.log("connected");
		
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
					// console.log(doc);
					
					// while (doc.head.firstChild) {
					// 	this.head.appendChild(doc.head.firstChild);
					// }
					console.log(doc);
					
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
