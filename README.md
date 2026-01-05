# th2

This repository now includes a minimal vanilla JavaScript example that uses node modules and bundles them for the browser with `esbuild`.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Start a dev server (bundles on the fly and serves `public`):

```bash
npm run start
# then open http://localhost:8000 (esbuild default port)
```

3. Build for production:

```bash
npm run build
```

Publishing

Publish to npm (library):

- Update `name` and other fields in `package.json` to match your package.
- Ensure the package name is available on npm.
- Build before publishing (the `prepublishOnly` script runs `npm run build`):

```bash
npm publish --access public
```

Host built site on GitHub Pages (example):

1. Make sure the repo is pushed to GitHub.
2. Run:

```bash
npm run publish:gh-pages
```

Notes

- The browser cannot import node packages directly; a bundler (like `esbuild`) resolves imports and produces a single `bundle.js` suitable for browsers.
- `@bobanum/webponents` is kept as a dependency and can be locally linked; the example source imports it.
# Theophile
