/*! mailcheck v2.0.0 @licence MIT */
const Mailcheck = {
  domainThreshold: 2,
  secondLevelThreshold: 2,
  topLevelThreshold: 2,

  defaultDomains: [
    "msn.com",
    "bellsouth.net",
    "telus.net",
    "comcast.net",
    "optusnet.com.au",
    "earthlink.net",
    "qq.com",
    "sky.com",
    "icloud.com",
    "mac.com",
    "sympatico.ca",
    "googlemail.com",
    "att.net",
    "xtra.co.nz",
    "web.de",
    "cox.net",
    "gmail.com",
    "ymail.com",
    "aim.com",
    "rogers.com",
    "verizon.net",
    "rocketmail.com",
    "google.com",
    "optonline.net",
    "sbcglobal.net",
    "aol.com",
    "me.com",
    "btinternet.com",
    "charter.net",
    "shaw.ca",
  ],

  defaultSecondLevelDomains: ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"],

  defaultTopLevelDomains: [
    "com",
    "com.au",
    "com.tw",
    "ca",
    "co.nz",
    "co.uk",
    "de",
    "fr",
    "it",
    "ru",
    "net",
    "org",
    "edu",
    "gov",
    "jp",
    "nl",
    "kr",
    "se",
    "eu",
    "ie",
    "co.il",
    "us",
    "at",
    "be",
    "dk",
    "hk",
    "es",
    "gr",
    "ch",
    "no",
    "cz",
    "in",
    "net.au",
    "info",
    "biz",
    "mil",
    "co.jp",
    "sg",
    "hu",
    "uk",
  ],

  run(opts) {
    opts.domains = opts.domains || Mailcheck.defaultDomains;
    opts.secondLevelDomains = opts.secondLevelDomains || Mailcheck.defaultSecondLevelDomains;
    opts.topLevelDomains = opts.topLevelDomains || Mailcheck.defaultTopLevelDomains;
    opts.distanceFunction = opts.distanceFunction || Mailcheck.sift4Distance;

    const defaultCallback = (result) => result;
    const suggestedCallback = opts.suggested || defaultCallback;
    const emptyCallback = opts.empty || defaultCallback;

    const result = Mailcheck.suggest(Mailcheck.encodeEmail(opts.email), opts.domains, opts.secondLevelDomains, opts.topLevelDomains, opts.distanceFunction);

    return result ? suggestedCallback(result) : emptyCallback();
  },

  suggest(email, domains, secondLevelDomains, topLevelDomains, distanceFunction) {
    email = email.toLowerCase();

    const emailParts = this.splitEmail(email);

    if (secondLevelDomains && topLevelDomains) {
      if (secondLevelDomains.indexOf(emailParts.secondLevelDomain) !== -1 && topLevelDomains.indexOf(emailParts.topLevelDomain) !== -1) {
        return false;
      }
    }

    let closestDomain = this.findClosestDomain(emailParts.domain, domains, distanceFunction, this.domainThreshold);

    if (closestDomain) {
      if (closestDomain === emailParts.domain) {
        return false;
      }
      return {
        address: emailParts.address,
        domain: closestDomain,
        full: `${emailParts.address}@${closestDomain}`,
      };
    }

    const closestSecondLevelDomain = this.findClosestDomain(emailParts.secondLevelDomain, secondLevelDomains, distanceFunction, this.secondLevelThreshold);
    const closestTopLevelDomain = this.findClosestDomain(emailParts.topLevelDomain, topLevelDomains, distanceFunction, this.topLevelThreshold);

    if (emailParts.domain) {
      closestDomain = emailParts.domain;
      let changed = false;

      if (closestSecondLevelDomain && closestSecondLevelDomain !== emailParts.secondLevelDomain) {
        closestDomain = closestDomain.replace(emailParts.secondLevelDomain, closestSecondLevelDomain);
        changed = true;
      }

      if (closestTopLevelDomain && closestTopLevelDomain !== emailParts.topLevelDomain && emailParts.secondLevelDomain !== "") {
        closestDomain = closestDomain.replace(new RegExp(`${emailParts.topLevelDomain}$`), closestTopLevelDomain);
        changed = true;
      }

      if (changed) {
        return {
          address: emailParts.address,
          domain: closestDomain,
          full: `${emailParts.address}@${closestDomain}`,
        };
      }
    }

    return false;
  },

  findClosestDomain(domain, domains, distanceFunction, threshold) {
    threshold = threshold || this.topLevelThreshold;
    let dist;
    let minDist = Infinity;
    let minLegacyDist = Infinity;
    let closestDomain = null;

    if (!domain || !domains) {
      return false;
    }
    if (!distanceFunction) {
      distanceFunction = this.sift4Distance;
    }

    const useLegacyTieBreak = distanceFunction === this.sift4Distance && domains === this.defaultDomains;

    for (let i = 0; i < domains.length; i++) {
      if (domain === domains[i]) {
        return domain;
      }
      dist = distanceFunction(domain, domains[i]);
      if (dist < minDist) {
        minDist = dist;
        closestDomain = domains[i];
        if (useLegacyTieBreak) {
          minLegacyDist = this.sift3Distance(domain, domains[i]);
        }
      } else if (useLegacyTieBreak && dist === minDist) {
        const legacyDist = this.sift3Distance(domain, domains[i]);
        if (legacyDist < minLegacyDist) {
          minLegacyDist = legacyDist;
          closestDomain = domains[i];
        }
      }
    }

    if (minDist <= threshold && closestDomain !== null) {
      return closestDomain;
    }
    return false;
  },

  sift3Distance(s1, s2, maxOffset = 5) {
    // Keep sift3 as a tie-breaker to preserve historical suggestions.
    if (!s1?.length) {
      return s2 ? s2.length : 0;
    }
    if (!s2?.length) {
      return s1.length;
    }

    let c = 0;
    let offset1 = 0;
    let offset2 = 0;
    let lcs = 0;

    while (c + offset1 < s1.length && c + offset2 < s2.length) {
      if (s1.charAt(c + offset1) === s2.charAt(c + offset2)) {
        lcs++;
      } else {
        offset1 = 0;
        offset2 = 0;
        for (let i = 0; i < maxOffset; i++) {
          if (c + i < s1.length && s1.charAt(c + i) === s2.charAt(c)) {
            offset1 = i;
            break;
          }
          if (c + i < s2.length && s1.charAt(c) === s2.charAt(c + i)) {
            offset2 = i;
            break;
          }
        }
      }
      c++;
    }

    return (s1.length + s2.length) / 2 - lcs;
  },

  sift4Distance(s1, s2, maxOffset = 5) {
    // sift4: https://siderite.dev/blog/super-fast-and-accurate-string-distance.html
    if (!s1?.length) {
      return s2 ? s2.length : 0;
    }
    if (!s2?.length) {
      return s1.length;
    }

    const l1 = s1.length;
    const l2 = s2.length;

    let c1 = 0;
    let c2 = 0;
    let lcss = 0;
    let local_cs = 0;
    let trans = 0;
    const offset_arr = [];

    while (c1 < l1 && c2 < l2) {
      if (s1.charAt(c1) === s2.charAt(c2)) {
        local_cs++;
        let isTrans = false;
        let i = 0;
        while (i < offset_arr.length) {
          const ofs = offset_arr[i];
          if (c1 <= ofs.c1 || c2 <= ofs.c2) {
            isTrans = Math.abs(c2 - c1) >= Math.abs(ofs.c2 - ofs.c1);
            if (isTrans) {
              trans++;
            } else {
              if (!ofs.trans) {
                ofs.trans = true;
                trans++;
              }
            }
            break;
          } else {
            if (c1 > ofs.c2 && c2 > ofs.c1) {
              offset_arr.splice(i, 1);
            } else {
              i++;
            }
          }
        }
        offset_arr.push({ c1, c2, trans: isTrans });
      } else {
        lcss += local_cs;
        local_cs = 0;
        if (c1 !== c2) {
          c1 = c2 = Math.min(c1, c2);
        }
        for (let j = 0; j < maxOffset && (c1 + j < l1 || c2 + j < l2); j++) {
          if (c1 + j < l1 && s1.charAt(c1 + j) === s2.charAt(c2)) {
            c1 += j - 1;
            c2--;
            break;
          }
          if (c2 + j < l2 && s1.charAt(c1) === s2.charAt(c2 + j)) {
            c1--;
            c2 += j - 1;
            break;
          }
        }
      }
      c1++;
      c2++;
      if (c1 >= l1 || c2 >= l2) {
        lcss += local_cs;
        local_cs = 0;
        c1 = c2 = Math.min(c1, c2);
      }
    }
    lcss += local_cs;
    return Math.round(Math.max(l1, l2) - lcss + trans);
  },

  splitEmail(email) {
    email = email !== null ? email.trim() : null;
    const parts = email.split("@");

    if (parts.length < 2) {
      return false;
    }

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === "") {
        return false;
      }
    }

    const domain = parts.pop();
    const domainParts = domain.split(".");
    let sld = "";
    let tld = "";

    if (domainParts.length === 0) {
      return false;
    } else if (domainParts.length === 1) {
      tld = domainParts[0];
    } else {
      sld = domainParts[0];
      for (let j = 1; j < domainParts.length; j++) {
        tld += `${domainParts[j]}.`;
      }
      tld = tld.substring(0, tld.length - 1);
    }

    return {
      topLevelDomain: tld,
      secondLevelDomain: sld,
      domain,
      address: parts.join("@"),
    };
  },

  // Encode the email address to prevent XSS but leave in valid
  // characters, following this official spec:
  // http://en.wikipedia.org/wiki/Email_address#Syntax
  encodeEmail(email) {
    let result = encodeURI(email);
    result = result
      .replaceAll("%20", " ")
      .replaceAll("%25", "%")
      .replaceAll("%5E", "^")
      .replaceAll("%60", "`")
      .replaceAll("%7B", "{")
      .replaceAll("%7C", "|")
      .replaceAll("%7D", "}");
    return result;
  },
};

export { Mailcheck, Mailcheck as default };
