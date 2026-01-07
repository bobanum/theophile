import '../node_modules/@bobanum/webponents/src/Title.js';
import './components/Template.js';
document.body.appendChild(document.createElement('h1')).textContent = 'App Component Loaded'	;
export default class App {
	static test() {
		return 'test';
	}
}