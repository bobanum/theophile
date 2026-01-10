// import '@bobanum/webponents';
import '../node_modules/@bobanum/webponents';

// import '../node_modules/@bobanum/webponents/src/Title/index.js.js';
// import '../node_modules/@bobanum/webponents/src/Drawer/index.js';
import './components/Template/Template.js';
import './components/Toc/Toc.js';
document.body.appendChild(document.createElement('h1')).textContent = 'App Component Loaded'	;
export default class App {
	static test() {
		return 'test';
	}
}