# Theophile

A templating module that transforms a web page into a (Powerpoint-like) presentation.
> ⌚︎ = Not implemented yet.

## Components

| Component                          | Tag           | Description                                             |
| ---------------------------------- | ------------- | ------------------------------------------------------- |
| [Template](src/Template/README.md) | `th-template` | The main component that handles the presentation logic. |
| [Menu](src/Menu/README.md)         | `th-menu`     | A menu component for navigation.                        |
| [TOC](src/Toc/README.md)           | `th-toc`      | A table of contents component.                          |
| [Slide](src/Slide/README.md)⌚︎      | `th-slide`    | A slide component for displaying content.               |
| [Include](src/Include/README.md)   | `th-include`  | An include component for embedding other components.    |

## Usage

### Global JavaScript

```javascript
import Template from './src/Template/Template.js';
import Toc "./src/Toc/index.js";
import Template "./src/Template/index.js";
import Include "./src/Include/index.js";
import Menu "./src/Menu/index.js";
// ...

### On each page

```html
<script type="module" src="./index.js"></script>
```

## TODO

