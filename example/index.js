import Toc from "../src/Toc/Toc.js";
import Include from "../src/Include/Include.js";
import Menu from "../src/Menu/Menu.js";
import Template from "../src/Template/Template.js";

Include.ready().then(() => {
	document.body.appendChild(Toc.createElement({ header: "Table des matières", slot: "toc" }));
            // <th-menu src="./menu.txt"></th-menu>
	document.body.appendChild(Menu.createElement({ src: "menu.txt", slot: "menu" }));
	Template.apply("template/template.html", "body");
});