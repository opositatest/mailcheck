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

#### npm ####

```
npm install --save mailcheck
```

Usage with jQuery
-----

First, include jQuery and Mailcheck into the page.

```html
<script src="jquery.min.js"></script>
<script src="mailcheck.min.js"></script>
```

Have a text field.

```html
<input id="email" name="email" type="email" />
```

Now, attach Mailcheck to the text field. You can declare an array of domains, second level domains and top level domains you want to check against.

```html
<script>
var domains = ['gmail.com', 'aol.com'];
var secondLevelDomains = ['hotmail'];
var topLevelDomains = ['com', 'net', 'org'];

$('#email').on('blur', function() {
  $(this).mailcheck({
    domains: domains,                       // optional
    secondLevelDomains: secondLevelDomains, // optional
    topLevelDomains: topLevelDomains,       // optional
    suggested: function(element, suggestion) {
      // callback code
    },
    empty: function(element) {
      // callback code
    }
  });
});
</script>
```

Mailcheck takes in two callbacks, `suggested` and `empty`. We recommend you supply both.

`suggested` is called when there's a suggestion. Mailcheck passes in the target element and the suggestion. The suggestion is an object with the following members:

```js
{
  address: 'test',         // the address; part before the @ sign
  domain: 'gmail.com',     // the suggested domain
  full: 'test@gmail.com'   // the full suggested email
}
```

`empty` is called when there's no suggestion. It is a good idea to use this callback to clear an existing suggestion.

Usage without jQuery
--------------------

Mailcheck is decoupled from jQuery. Call `Mailcheck.run` directly:

```js
Mailcheck.run({
  email: yourTextInput.value,
  domains: domains,                       // optional
  topLevelDomains: topLevelDomains,       // optional
  secondLevelDomains: secondLevelDomains, // optional
  suggested: function(suggestion) {
    // callback code
  },
  empty: function() {
    // callback code
  }
});
```

Usage on Node.js
----------------

```js
const mailcheck = require('mailcheck');

mailcheck.run({
  // see 'usage without jQuery' above.
});
```

Domains
-------

Mailcheck has inbuilt defaults if the `domains`, `secondLevelDomains` or `topLevelDomains` options aren't provided. We still recommend supplying your own domains based on the distribution of your users.

#### Adding your own Domains ####

You can replace Mailcheck's default domain/TLD suggestions by supplying replacements to `mailcheck.run`:

```js
Mailcheck.run({
  domains: ['customdomain.com', 'anotherdomain.net'], // replaces existing domains
  secondLevelDomains: ['domain', 'yetanotherdomain'], // replaces existing SLDs
  topLevelDomains: ['com.au', 'ru']                   // replaces existing TLDs
});
```

Alternatively, you can *extend* Mailcheck's global set of default domains and TLDs:

```js
Mailcheck.defaultDomains.push('customdomain.com', 'anotherdomain.net');
Mailcheck.defaultSecondLevelDomains.push('domain', 'yetanotherdomain');
Mailcheck.defaultTopLevelDomains.push('com.au', 'ru');
```

Customization
-------------

The prime candidates for customization are `Mailcheck.findClosestDomain` and `Mailcheck.stringDistance`.

Mailcheck uses the [sift4](https://siderite.dev/blog/super-fast-and-accurate-string-distance.html) string similarity algorithm. You can pass in your own distance function when calling Mailcheck:

```js
Mailcheck.run({
  email: 'test@gmailc.om',
  distanceFunction: function(s1, s2) {
    // return a distance score; lower = more similar
  }
});
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
- Run `npm run build` before committing — it runs lint, tests, and regenerates `src/mailcheck.min.js`. The pre-commit hook does this automatically after `npm install`.

Bugs and feature requests are managed in [Issues](https://github.com/mailcheck/mailcheck/issues).

License
-------

Released under the MIT License.
