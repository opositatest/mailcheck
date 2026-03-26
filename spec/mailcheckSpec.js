import Mailcheck from '../src/mailcheck.js';

describe('mailcheck', function () {
  const domains = ['google.com', 'gmail.com', 'emaildomain.com', 'comcast.net', 'facebook.com', 'msn.com'];
  const secondLevelDomains = ['yahoo', 'hotmail', 'mail', 'live', 'outlook', 'gmx'];
  const topLevelDomains = ['co.uk', 'com', 'org', 'info', 'fr'];

  describe('Mailcheck', function () {
    describe('run', function () {
      let suggestedSpy, emptySpy;

      beforeEach(function () {
        suggestedSpy = jasmine.createSpy();
        emptySpy = jasmine.createSpy();
      });

      it("calls the 'suggested' callback with the element and result when there's a suggestion", function () {
        Mailcheck.run({
          email: 'test@gmail.co',
          suggested: suggestedSpy,
          empty: emptySpy
        });

        expect(suggestedSpy).toHaveBeenCalledWith({
          address: 'test',
          domain: 'gmail.com',
          full: 'test@gmail.com'
        });

        expect(emptySpy).not.toHaveBeenCalled();
      });

      it("calls the 'empty' callback with the element when there's no suggestion", function () {
        Mailcheck.run({
          email: 'contact@kicksend.com',
          suggested: suggestedSpy,
          empty: emptySpy
        });

        expect(suggestedSpy).not.toHaveBeenCalled();
        expect(emptySpy).toHaveBeenCalled();
      });

      it("returns the result when 'suggested' callback is not defined", function () {
        const result = Mailcheck.run({
          email: 'test@gmail.co'
        });

        expect(result).toEqual({
          address: 'test',
          domain: 'gmail.com',
          full: 'test@gmail.com'
        });
      });

      it('takes in an array of specified domains', function () {
        Mailcheck.run({
          email: 'test@emaildomain.con',
          suggested: suggestedSpy,
          empty: emptySpy,
          domains
        });

        expect(suggestedSpy).toHaveBeenCalledWith({
          address: 'test',
          domain: 'emaildomain.com',
          full: 'test@emaildomain.com'
        });
      });
    });

    describe('encodeEmail', function () {
      it("escapes the element's value", function () {
        const result = Mailcheck.encodeEmail('<script>alert("a")</script>@emaildomain.con');
        expect(result).not.toMatch(/<script>/);
      });

      it('allows valid special characters', function () {
        const result = Mailcheck.encodeEmail(" g1!#$%&'*+-/=?^_`{|}@gmai.com");
        expect(result).toEqual(" g1!#$%&'*+-/=?^_`{|}@gmai.com");
      });

      it('allows multiple occurrences of valid special characters', function () {
        const result = Mailcheck.encodeEmail("{a}|{b}|{c}^`^@gmai.com");
        expect(result).toEqual("{a}|{b}|{c}^`^@gmai.com");
      });
    });

    describe('return value', function () {
      it('is a hash representing the email address', function () {
        const result = Mailcheck.suggest('test@gmail.co', domains);

        expect(result).toEqual({
          address: 'test',
          domain: 'gmail.com',
          full: 'test@gmail.com'
        });
      });

      it('is false when no suggestion is found', function () {
        expect(Mailcheck.suggest('contact@kicksend.com', domains)).toBeFalsy();
      });

      it('is false when an incomplete email is provided', function () {
        expect(Mailcheck.suggest('contact', domains)).toBeFalsy();
      });
    });

    describe('cases', function () {
      it('pass', function () {
        expect(Mailcheck.suggest('test@gmailc.om', domains).domain).toEqual('gmail.com');
        expect(Mailcheck.suggest('test@emaildomain.co', domains).domain).toEqual('emaildomain.com');
        expect(Mailcheck.suggest('test@gmail.con', domains).domain).toEqual('gmail.com');
        expect(Mailcheck.suggest('test@gnail.con', domains).domain).toEqual('gmail.com');
        expect(Mailcheck.suggest('test@GNAIL.con', domains).domain).toEqual('gmail.com');
        expect(Mailcheck.suggest('test@#gmail.com', domains).domain).toEqual('gmail.com');
        expect(Mailcheck.suggest('test@comcast.nry', domains).domain).toEqual('comcast.net');

        expect(
          Mailcheck.suggest('test@homail.con', domains, secondLevelDomains, topLevelDomains).domain
        ).toEqual('hotmail.com');
        expect(
          Mailcheck.suggest('test@hotmail.co', domains, secondLevelDomains, topLevelDomains).domain
        ).toEqual('hotmail.com');
        expect(
          Mailcheck.suggest('test@yajoo.com', domains, secondLevelDomains, topLevelDomains).domain
        ).toEqual('yahoo.com');
        expect(
          Mailcheck.suggest(
            'test@randomsmallcompany.cmo',
            domains,
            secondLevelDomains,
            topLevelDomains
          ).domain
        ).toEqual('randomsmallcompany.com');

        expect(
          Mailcheck.suggest('test@con-artists.con', domains, secondLevelDomains, topLevelDomains).domain
        ).toEqual('con-artists.com');

        expect(Mailcheck.suggest('', domains)).toBeFalsy();
        expect(Mailcheck.suggest('test@', domains)).toBeFalsy();
        expect(Mailcheck.suggest('test', domains)).toBeFalsy();

        expect(
          Mailcheck.suggest(
            'test@mail.randomsmallcompany.cmo',
            domains,
            secondLevelDomains,
            topLevelDomains
          ).domain
        ).toBeFalsy();
      });

      it('will not offer a suggestion that itself leads to another suggestion', function () {
        const suggestion = Mailcheck.suggest('test@yahooo.cmo', domains, secondLevelDomains, topLevelDomains);
        expect(suggestion.domain).toEqual('yahoo.com');
      });

      it('will not offer suggestions for valid 2ld-tld combinations', function () {
        expect(
          Mailcheck.suggest('test@yahoo.co.uk', domains, secondLevelDomains, topLevelDomains)
        ).toBeFalsy();
      });

      it("will not offer suggestions for valid 2ld-tld even if theres a close fully-specified domain", function () {
        expect(
          Mailcheck.suggest('test@gmx.fr', domains, secondLevelDomains, topLevelDomains)
        ).toBeFalsy();
      });

      it("will not offer suggestions for unrecognised 2ld's without a tld", function () {
        expect(Mailcheck.suggest('test@gm', domains, secondLevelDomains, topLevelDomains)).toBeFalsy();
        expect(Mailcheck.suggest('test@gma', domains, secondLevelDomains, topLevelDomains)).toBeFalsy();
        expect(Mailcheck.suggest('test@gmai', domains, secondLevelDomains, topLevelDomains)).toBeFalsy();
      });
    });

    describe('Mailcheck.splitEmail', function () {
      it('returns a hash of the address, the domain, and the top-level domain', function () {
        expect(Mailcheck.splitEmail('test@example.com')).toEqual({
          address: 'test',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });

        expect(Mailcheck.splitEmail('test@example.co.uk')).toEqual({
          address: 'test',
          domain: 'example.co.uk',
          topLevelDomain: 'co.uk',
          secondLevelDomain: 'example'
        });

        expect(Mailcheck.splitEmail('test@mail.randomsmallcompany.co.uk')).toEqual({
          address: 'test',
          domain: 'mail.randomsmallcompany.co.uk',
          topLevelDomain: 'randomsmallcompany.co.uk',
          secondLevelDomain: 'mail'
        });
      });

      it('splits RFC compliant emails', function () {
        expect(Mailcheck.splitEmail('"foo@bar"@example.com')).toEqual({
          address: '"foo@bar"',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(Mailcheck.splitEmail('containsnumbers1234567890@example.com')).toEqual({
          address: 'containsnumbers1234567890',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(Mailcheck.splitEmail('contains+symbol@example.com')).toEqual({
          address: 'contains+symbol',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(Mailcheck.splitEmail('contains-symbol@example.com')).toEqual({
          address: 'contains-symbol',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(Mailcheck.splitEmail('contains.symbol@domain.contains.symbol')).toEqual({
          address: 'contains.symbol',
          domain: 'domain.contains.symbol',
          topLevelDomain: 'contains.symbol',
          secondLevelDomain: 'domain'
        });
        expect(Mailcheck.splitEmail('"contains.and\\ symbols"@example.com')).toEqual({
          address: '"contains.and\\ symbols"',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(Mailcheck.splitEmail('"contains.and.@.symbols.com"@example.com')).toEqual({
          address: '"contains.and.@.symbols.com"',
          domain: 'example.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'example'
        });
        expect(
          Mailcheck.splitEmail(
            '"()<>[]:;@,\\\\"!#$%&\'*+-/=?^_`{}|\\ \\ \\ \\ \\ ~\\ \\ \\ \\ \\ \\ \\ ?\\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ ^_`{}|~.a"@allthesymbols.com'
          )
        ).toEqual({
          address:
            '"()<>[]:;@,\\\\"!#$%&\'*+-/=?^_`{}|\\ \\ \\ \\ \\ ~\\ \\ \\ \\ \\ \\ \\ ?\\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ ^_`{}|~.a"',
          domain: 'allthesymbols.com',
          topLevelDomain: 'com',
          secondLevelDomain: 'allthesymbols'
        });
        expect(Mailcheck.splitEmail('postbox@com')).toEqual({
          address: 'postbox',
          domain: 'com',
          topLevelDomain: 'com',
          secondLevelDomain: ''
        });
      });

      it('returns false for email addresses that are not RFC compliant', function () {
        expect(Mailcheck.splitEmail('example.com')).toBeFalsy();
        expect(Mailcheck.splitEmail('abc.example.com')).toBeFalsy();
        expect(Mailcheck.splitEmail('@example.com')).toBeFalsy();
        expect(Mailcheck.splitEmail('test@')).toBeFalsy();
      });

      it('trims spaces from the start and end of the string', function () {
        expect(Mailcheck.splitEmail(' postbox@com')).toEqual({
          address: 'postbox',
          domain: 'com',
          topLevelDomain: 'com',
          secondLevelDomain: ''
        });
        expect(Mailcheck.splitEmail('postbox@com ')).toEqual({
          address: 'postbox',
          domain: 'com',
          topLevelDomain: 'com',
          secondLevelDomain: ''
        });
      });
    });

    describe('Mailcheck.findClosestDomain', function () {
      it('returns the most similar domain', function () {
        expect(Mailcheck.findClosestDomain('google.com', domains)).toEqual('google.com');
        expect(Mailcheck.findClosestDomain('gmail.com', domains)).toEqual('gmail.com');
        expect(Mailcheck.findClosestDomain('emaildoman.com', domains)).toEqual('emaildomain.com');
        expect(Mailcheck.findClosestDomain('gmsn.com', domains)).toEqual('msn.com');
        expect(Mailcheck.findClosestDomain('gmaik.com', domains)).toEqual('gmail.com');
      });

      it('returns the most similar second-level domain', function () {
        expect(Mailcheck.findClosestDomain('hotmial', secondLevelDomains)).toEqual('hotmail');
        expect(Mailcheck.findClosestDomain('tahoo', secondLevelDomains)).toEqual('yahoo');
        expect(Mailcheck.findClosestDomain('livr', secondLevelDomains)).toEqual('live');
        expect(Mailcheck.findClosestDomain('outllok', secondLevelDomains)).toEqual('outlook');
      });

      it('returns the most similar top-level domain', function () {
        expect(Mailcheck.findClosestDomain('cmo', topLevelDomains)).toEqual('com');
        expect(Mailcheck.findClosestDomain('ogr', topLevelDomains)).toEqual('org');
        expect(Mailcheck.findClosestDomain('ifno', topLevelDomains)).toEqual('info');
        expect(Mailcheck.findClosestDomain('com.uk', topLevelDomains)).toEqual('co.uk');
      });
    });
  });
});
