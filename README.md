mailcheck.js
=========

[![CI](https://github.com/mailcheck/mailcheck/actions/workflows/ci.yml/badge.svg)](https://github.com/mailcheck/mailcheck/actions/workflows/ci.yml)
[![Security](https://github.com/mailcheck/mailcheck/actions/workflows/security.yml/badge.svg)](https://github.com/mailcheck/mailcheck/actions/workflows/security.yml)

> This is a maintained fork of the original [mailcheck/mailcheck](https://github.com/mailcheck/mailcheck), which is no longer actively maintained.

The Javascript library and jQuery plugin that suggests a right domain when your users misspell it in an email address.

What does it do?
----------------

When your user types in "user@gmil.con", Mailcheck will suggest "user@gmail.com".

Mailcheck will offer up suggestions for second and top level domains too. For example, when a user types in "user@hotmail.cmo", "hotmail.com" will be suggested. Similarly, if only the second level domain is misspelled, it will be corrected independently of the top level domain.

![diagram](https://raw.githubusercontent.com/mailcheck/mailcheck/master/doc/example.png)

Installation
------------

```
npm install --save mailcheck
```

Usage
-----

#### ESM (recommended)

```js
import Mailcheck from 'mailcheck';

Mailcheck.run({
  email: yourTextInput.value,
  domains: ['gmail.com', 'aol.com'],           // optional
  secondLevelDomains: ['hotmail'],             // optional
  topLevelDomains: ['com', 'net', 'org'],      // optional
  suggested(suggestion) {
    // show suggestion to user
    // suggestion = { address: 'test', domain: 'gmail.com', full: 'test@gmail.com' }
  },
  empty() {
    // clear any existing suggestion
  }
});
```

#### CommonJS

```js
const Mailcheck = require('mailcheck');

Mailcheck.run({ /* same options */ });
```

#### Browser via `<script>` tag

Use `dist/mailcheck.browser.min.js`, which also auto-registers the jQuery plugin if `window.jQuery` is present:

```html
<script src="mailcheck.browser.min.js"></script>
<script>
  Mailcheck.run({ email: 'test@gmailc.om', suggested(s) { console.log(s.full); } });
</script>
```

#### With jQuery

Load `mailcheck.browser.min.js` after jQuery and use `$.fn.mailcheck`:

```html
<script src="jquery.min.js"></script>
<script src="mailcheck.browser.min.js"></script>
<script>
$('#email').on('blur', function() {
  $(this).mailcheck({
    suggested(element, suggestion) {
      // show suggestion
    },
    empty(element) {
      // clear suggestion
    }
  });
});
</script>
```

The `suggested` callback receives the jQuery element and the suggestion object. The `empty` callback receives the jQuery element.

Suggestion object
-----------------

```js
{
  address: 'test',         // part before the @ sign
  domain: 'gmail.com',     // suggested domain
  full: 'test@gmail.com'   // full suggested email
}
```

Domains
-------

Mailcheck has inbuilt defaults if `domains`, `secondLevelDomains` or `topLevelDomains` are not provided. We recommend supplying your own based on the distribution of your users.

Replace the defaults entirely:

```js
Mailcheck.run({
  domains: ['customdomain.com', 'anotherdomain.net'],
  secondLevelDomains: ['domain', 'yetanotherdomain'],
  topLevelDomains: ['com.au', 'ru']
});
```

Or extend the global defaults:

```js
Mailcheck.defaultDomains.push('customdomain.com');
Mailcheck.defaultSecondLevelDomains.push('yetanotherdomain');
Mailcheck.defaultTopLevelDomains.push('com.au');
```

Customization
-------------

Mailcheck uses the [sift4](https://siderite.dev/blog/super-fast-and-accurate-string-distance.html) string similarity algorithm. You can replace it with your own:

```js
Mailcheck.run({
  email: 'test@gmailc.om',
  distanceFunction(s1, s2) {
    // return a distance score; lower = more similar
  }
});
```

TypeScript
----------

Types are included:

```ts
import Mailcheck, { MailcheckOptions, MailcheckSuggestion } from 'mailcheck';

const opts: MailcheckOptions = {
  email: 'test@gmailc.om',
  suggested(suggestion: MailcheckSuggestion) {
    console.log(suggestion.full);
  }
};

Mailcheck.run(opts);
```

Tests
-----

Requires Node.js ≥ 22.

```
npm test
```

Contributing
------------

Pull requests are welcome. To get them accepted, please:

- Add test cases to `spec/mailcheckSpec.js` for any new behaviour.
- Run `npm run build` before committing — it runs lint, tests, and regenerates `dist/`. The pre-commit hook does this automatically after `npm install`.

Bugs and feature requests are managed in [Issues](https://github.com/mailcheck/mailcheck/issues).

License
-------

Released under the MIT License.
