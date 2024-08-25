# Toc Plugin

This plugin allows you to display a table of contents in your document.

## Usage

### Toc example

```html
<th-toc>
    <h1>Table of Contents</h1>
    <ul>
        <li><a href="#section1">Section 1</a></li>
        <li><a href="#section2">Section 2</a></li>
        <li><a href="#section3">Section 3</a></li>
    </ul>
</th-toc>
```

### Attributes

| Attribute    | Description                                        | Default      |
| ------------ | -------------------------------------------------- | ------------ |
| `title`      | The title of the table of contents.                | ``           |
| `domain`     | The domain of the table of contents.               | `body`       |
| `headings`   | The selector of the table of contents.             | `h1, h2, h3` |
| `backlinks`  | Add backlinks to the table of contents's targets.  | `false`      |
| `permalinks` | Add permalinks to the table of contents's targets. | `false`      |
