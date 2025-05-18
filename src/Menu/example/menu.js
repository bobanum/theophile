// menu.js (dummy example)
const menu = [
	{ label: "Home", href: "index.html" },
	{
		label: "Courses",
		icon: "book",
		children: [
			{ label: "Course 1", href: "courses/01.html" },
			{ label: "Course 2", href: "courses/02.html", disabled: true }
		]
	},
	{ label: "Contact", href: "contact.html" }
];
// Possible data manipulation here.
// For example, you can add a new item to the menu

export default menu;
