import terser from '@rollup/plugin-terser';

const banner = '/*! mailcheck v2.0.0 @licence MIT */';

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
      banner
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
