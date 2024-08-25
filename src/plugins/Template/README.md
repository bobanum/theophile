# Template Plugin

This plugin allows you to display a page with a custom template.

## Usage

### Template example

```html
<template>
    <link rel="stylesheet" href="css/example.css">
    <div id="app">
        <header><h1>My cute example</h1></header>
        <div class="content">
            <slot></slot>
        </div>
        <footer>&copy; 2038 By Myself</footer>
    </div>
    <slot name="toc"></slot>
</template>
```

### Page example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module">
        import Template from "../src/plugins/Template/Template.js";
        // App.exec();
    </script>
    <title>My First Document</title>
</head>
<body>
    <th-template href="template2.html">
    </th-template>
</body>
</html>
```
