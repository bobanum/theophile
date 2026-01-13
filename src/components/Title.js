import Webponent from "./Webponent.js";

export class Title extends Webponent {
	constructor() {
		super();
		this.shadowRoot.appendChild(super.dom.slot("before"));
		// this.shadowRoot.textContent = document.title;
		this.shadowRoot.appendChild(document.createTextNode(document.title));
		this.shadowRoot.appendChild(super.dom.slot());
		this.shadowRoot.appendChild(super.dom.slot("after"));
	}
}

Title.register("title");
export default Title;