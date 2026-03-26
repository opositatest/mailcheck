# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test          # lint (jshint) + run Jasmine tests
npm run uglify    # minify src/mailcheck.js → src/mailcheck.min.js
grunt             # lint + test + minify (also runs as pre-commit hook)
```

To run tests without minifying: `grunt test`

After any change to `src/mailcheck.js`, run `grunt` (or `npm run uglify`) to regenerate `src/mailcheck.min.js` — both files are committed together.

## Architecture

The entire library is a single file: `src/mailcheck.js`. There is no build step beyond minification.

**`Mailcheck` object** exposes these public methods and properties:

- `Mailcheck.run(opts)` — entry point; merges defaults, calls `suggest`, invokes callbacks
- `Mailcheck.suggest(email, domains, slds, tlds, distanceFn)` — core logic; splits email, finds closest domain match
- `Mailcheck.findClosestDomain(domain, domains, distanceFn, threshold)` — iterates candidates using `sift4Distance`
- `Mailcheck.splitEmail(email)` → `{ address, domain, secondLevelDomain, topLevelDomain }`
- `Mailcheck.sift4Distance(s1, s2)` — string similarity algorithm (sift4); lower = more similar
- `Mailcheck.defaultDomains`, `Mailcheck.defaultSecondLevelDomains`, `Mailcheck.defaultTopLevelDomains` — extend these arrays to add domains globally

**Domain matching logic** (`suggest`):
1. If the typed SLD+TLD both exactly match known lists → no suggestion
2. Try matching full domain against `domains` list with threshold `domainThreshold` (2)
3. If no full-domain match, independently match SLD and TLD, then reconstruct suggestion

**Module exports**: CommonJS (`module.exports`), AMD (`define`), and jQuery plugin (`$.fn.mailcheck`) are all defined at the bottom of the same file, guarded by environment checks.

**Tests** live in `spec/mailcheckSpec.js` (Jasmine). The spec runner HTML (`spec/spec_runner.html`) can also be opened in a browser for in-browser test runs.
