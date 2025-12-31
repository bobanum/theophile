export default class TaskList extends EventTarget {
	constructor(entries) {
		super();
		this._tasks = new Set(entries);
	}

	add(task) {
		if (this._tasks.has(task)) return;

		this._tasks.add(task);

		task.addEventListener("ready", () => {
			this._tasks.delete(task);
		}, { once: true });
		return this;
	}
	delete(task) {
		let result = this._tasks.delete(task);

		if (this._tasks.size === 0) {
			this.dispatchEvent(new CustomEvent("empty"));
		}
		return result;
	}
	complete() {
		if (this._tasks.size === 0) {
			return Promise.resolve();
		}
		return new Promise((resolve) => {

			this.addEventListener("empty", () => {
				resolve();
			});
		});
	}
	has(...args) {
		return this._tasks.has(...args);
	}
}