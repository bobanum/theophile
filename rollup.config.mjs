import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // ESM build for modern bundlers and Node with type: module
  {
    input: 'src/main.js',
    output: {
      file: 'dist/esm/index.js',
      format: 'esm',
      sourcemap: true
    },
    external: ['lodash'],
    plugins: [resolve(), commonjs()]
  },
  // CJS build for Node.js require()
  {
    input: 'src/main.js',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true
    },
    external: ['lodash'],
    plugins: [resolve(), commonjs()]
  },
  // UMD build for CDN usage (bundles all dependencies)
  {
    input: 'src/main.js',
    output: {
      file: 'dist/bundle.umd.min.js',
      format: 'umd',
      name: 'Th2',
      sourcemap: true,
      globals: {
        lodash: '_'
      }
    },
    external: ['lodash'],
    plugins: [resolve(), commonjs(), terser()]
  },
  // UMD build with all dependencies bundled (standalone)
  {
    input: 'src/main.js',
    output: {
      file: 'dist/bundle.standalone.min.js',
      format: 'umd',
      name: 'Th2',
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), terser()]
  }
];
