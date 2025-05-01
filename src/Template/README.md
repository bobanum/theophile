# Theophile template

## Base template

```
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8" />
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
	<!-- Will be applied to all the page -->
	<link rel="stylesheet" href="./css/boilerplate.css" />
	<title>Lorem Template</title>
</head>

<body>
	<template>
		<!-- Will be applied to the template itself -->
		<link rel="stylesheet" href="./css/style.css"/>
		<div id="interface">
			<header>
				<slot name="header">
					<h1>Default header</h1>
				</slot>
			</header>
			<div class="body" id="app">
				<slot></slot>
			</div>
			<footer><strong>Lorem Template</strong></footer>
		</div>

	</template>
</body>

</html>
```

## The page

````html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script type="module" src="./src/Template/Template.js"></script>
	<title>Example Page</title>
</head>
<body>
	<th-template href="template/template.html">
		<h1 slot="header">The title</h1>
		<p>Lorem ipsum dolor sit amet...</p>
	</th-template>
</body>
</html>
```
### Alternative

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script type="module">
		import Template from './src/Template/index.js';
		Template.apply('body', 'template/template.html');
	</script>
	<title>Muspi Merol</title>

</head>
<body>
	<h1 slot="header">The title</h1>
	<p>Lorem ipsum dolor sit amet...</p>
</body>
</html>
```