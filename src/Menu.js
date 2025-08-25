export default class Menu {
    constructor(items) {
        this.items = items;
    }

    render() {
        const menu = document.createElement("ul");
        this.items.forEach(item => {
            const menuItem = this.DOM.li(item);
            menu.appendChild(menuItem);
        });
        return menu;
    }
    DOM = {
        li: (item) => {
            if (item.hidden) return document.createDocumentFragment();
            const li = document.createElement("li");
            if (!item.title) {
                li.classList.add("separateur");
                return li;
            }
            if (item.disabled) li.classList.add("disabled");
            let trigger = this.DOM.trigger(item);
            li.appendChild(trigger);
            if (item.attributes) {
                Object.entries(item.attributes).forEach(([key, value]) => {
                    li.setAttribute(key, value);
                });
            }
            if (item.submenu) {
                const ul = document.createElement("ul");
                item.submenu.forEach(subitem => {
                    const subMenuItem = this.DOM.li(subitem);
                    ul.appendChild(subMenuItem);
                });
                li.appendChild(ul);
            }
            return li;
        },
        trigger: (item) => {
            let trigger;
            if (item.url) {
                trigger = document.createElement("a");
                trigger.href = item.url;
                if (item.target) trigger.target = item.target;
            } else {
                trigger = document.createElement("span");
            }
            if (item.icon) {
                const icon = document.createElement("img");
                icon.src = item.icon;
                icon.alt = item.title;
                trigger.appendChild(icon);
            }
            trigger.appendChild(document.createTextNode(item.title));
            if (item.evt) {
                Object.entries(item.evt).forEach(([event, handler]) => {
                    trigger.addEventListener(event, handler);
                });
            }
            return trigger;
        },
    }
}
