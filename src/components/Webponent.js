import Base from '../../node_modules/@bobanum/webponents/src/Webponent.js';
export class Webponent extends Base {
	static affix = 'th-';
	parseHTML(html) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		return doc;
	}
}

export default Webponent;