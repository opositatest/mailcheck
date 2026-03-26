# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build     # lint + test + bundle (also runs as pre-commit hook)
npm test          # run Jasmine tests only
npm run lint      # Biome check (lint + format check)
npm run lint:fix  # Biome check --write (auto-fix)
npm run bundle    # rollup only — generates dist/
```

After any change to `src/mailcheck.js`, run `npm run build` to regenerate `dist/`. Commit `dist/` alongside source changes.

## Toolchain

- **Node ≥ 22** required
- **Biome 2** (`biome.json`) — linter + formatter
- **Jasmine 5** (`spec/support/jasmine.json`, `jsLoader: "import"`) — ESM test runner
- **Rollup 4** (`rollup.config.js`) — generates ESM, CJS and browser IIFE builds
- **Husky 9** (`.husky/pre-commit`) — runs `npm run build` on commit

## Architecture

The library is a single source file with no runtime dependencies.

### Source files (`src/`)

| File | Purpose |
|---|---|
| `mailcheck.js` | Core library — pure ESM, no jQuery |
| `mailcheck.jquery.js` | Optional jQuery plugin — imports core, auto-registers `$.fn.mailcheck` if `window.jQuery` exists |
| `mailcheck.d.ts` | TypeScript type definitions |

### Build outputs (`dist/`)

| File | Format | Use case |
|---|---|---|
| `mailcheck.mjs` | ESM | `import Mailcheck from 'mailcheck'` |
| `mailcheck.cjs` | CJS | `require('mailcheck')` |
| `mailcheck.browser.min.js` | IIFE minified | `<script>` tag, includes jQuery plugin |

### Public API (`Mailcheck` object)

- `Mailcheck.run(opts)` — entry point; merges defaults, calls `suggest`, invokes callbacks
- `Mailcheck.suggest(email, domains, slds, tlds, distanceFn)` — core logic; splits email, finds closest domain
- `Mailcheck.findClosestDomain(domain, domains, distanceFn, threshold)` — iterates candidates using `sift4Distance`
- `Mailcheck.splitEmail(email)` → `{ address, domain, secondLevelDomain, topLevelDomain }`
- `Mailcheck.sift4Distance(s1, s2)` — string similarity algorithm; lower = more similar
- `Mailcheck.defaultDomains`, `Mailcheck.defaultSecondLevelDomains`, `Mailcheck.defaultTopLevelDomains` — extend to add domains globally

### Domain matching logic (`suggest`)

1. If the typed SLD+TLD both exactly match known lists → no suggestion
2. Try matching full domain against `domains` list with `domainThreshold` (2)
3. If no full-domain match, independently match SLD and TLD, then reconstruct suggestion
