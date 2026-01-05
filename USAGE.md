# Usage Guide

This package can be used in multiple environments:

## 1. Node.js (CommonJS)

```javascript
const th2 = require('th2');
```

## 2. Node.js / Modern Bundlers (ESM)

```javascript
import th2 from 'th2';
```

## 3. CDN - Standalone (all dependencies bundled)

```html
<script src="https://unpkg.com/th2@0.1.0/dist/bundle.standalone.min.js"></script>
<script>
  // Access via global Th2 object
  console.log(Th2);
</script>
```

## 4. CDN - UMD (requires lodash separately)

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
<script src="https://unpkg.com/th2@0.1.0/dist/bundle.umd.min.js"></script>
<script>
  console.log(Th2);
</script>
```

## 5. ES Module from CDN

```html
<script type="module">
  import th2 from 'https://cdn.skypack.dev/th2@0.1.0';
  // or
  import th2 from 'https://esm.sh/th2@0.1.0';
</script>
```

## Build Commands

- `npm run build:rollup` - Build all distribution formats
- `npm run build:esbuild` - Build public demo bundle
- `npm run build` - Build everything
- `npm start` - Start dev server with live reload

## File Structure

```
dist/
  ├── cjs/            # CommonJS for Node.js
  │   └── index.js
  ├── esm/            # ES Modules for bundlers
  │   └── index.js
  ├── bundle.umd.min.js          # UMD build (lodash external)
  └── bundle.standalone.min.js    # Standalone (lodash bundled)
```

## Publishing

1. Update version in `package.json`
2. Run `npm run build:rollup` to generate dist files
3. Run `npm publish` to publish to npm
4. CDN links will auto-update via unpkg/jsdelivr
