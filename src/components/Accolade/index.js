import Webponent from "../Webponent.js";
import styles from "./accolade.css";

export class Accolade extends Webponent {
	connectedCallback() {
		let style = `<style>${styles}</style>`;
		// let part = `<div><span class="in"></span><span class="mid"></span><span class="out"></span></div>`;
		let part =
			`<span class="start"></span>` +
			`  <span class="mid">` +
			`    <span class="mid"></span>` +
			`    <span class="out">` +
			`      <span class="start"></span>` +
			`      <span class="end"></span>` +
			`    </span>` +
			`    <span class="mid"></span>` +
			`  </span>` +
			`<span class="end"></span>`;
		this.shadowRoot.innerHTML = style + part;
	}
}
Accolade.register("accolade");