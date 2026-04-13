import terser from '@rollup/plugin-terser';

const banner = '/*! mailcheck v2.0.2 @licence MIT */';

export default [
  // ESM + CJS builds (core only, no jQuery)
  {
    input: 'src/mailcheck.esm.js',
    output: {
      file: 'dist/mailcheck.mjs',
      format: 'esm',
      banner
    }
  },
  {
    input: 'src/mailcheck.js',
    output: {
      file: 'dist/mailcheck.cjs',
      format: 'cjs',
      exports: 'default',
      banner,
      // Preserve `require()` while exposing interop properties for Metro/Babel.
      footer: `Object.defineProperties(module.exports, {
        Mailcheck: { value: module.exports },
        default: { value: module.exports },
        __esModule: { value: true }
      });`
    }
  },
  // Browser IIFE build (includes jQuery plugin, minified)
  {
    input: 'src/mailcheck.jquery.js',
    output: {
      file: 'dist/mailcheck.browser.min.js',
      format: 'iife',
      name: 'Mailcheck',
      banner,
      plugins: [terser({ format: { comments: false } })]
    }
  }
];
