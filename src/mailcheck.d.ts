export interface MailcheckSuggestion {
  address: string;
  domain: string;
  full: string;
}

export interface MailcheckOptions {
  email: string;
  domains?: string[];
  secondLevelDomains?: string[];
  topLevelDomains?: string[];
  distanceFunction?: (s1: string, s2: string) => number;
  suggested?: (suggestion: MailcheckSuggestion) => void;
  empty?: () => void;
}

export interface MailcheckInstance {
  domainThreshold: number;
  secondLevelThreshold: number;
  topLevelThreshold: number;

  defaultDomains: string[];
  defaultSecondLevelDomains: string[];
  defaultTopLevelDomains: string[];

  run(opts: MailcheckOptions): MailcheckSuggestion | false | void;

  suggest(
    email: string,
    domains: string[],
    secondLevelDomains?: string[],
    topLevelDomains?: string[],
    distanceFunction?: (s1: string, s2: string) => number
  ): MailcheckSuggestion | false;

  findClosestDomain(
    domain: string,
    domains: string[],
    distanceFunction?: (s1: string, s2: string) => number,
    threshold?: number
  ): string | false;

  sift4Distance(s1: string, s2: string, maxOffset?: number): number;

  splitEmail(
    email: string
  ): { address: string; domain: string; secondLevelDomain: string; topLevelDomain: string } | false;

  encodeEmail(email: string): string;
}

declare const Mailcheck: MailcheckInstance;
export { Mailcheck };
export default Mailcheck;
