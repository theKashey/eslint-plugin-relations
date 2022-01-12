import { resolve, relative, sep } from 'path';

import { globToRegExp } from '../../utils/glob-to-regex';
import { RestrictionRule, RuleSchema, Rule } from './types';

const tryAsGlob = (location: string): RegExp | string =>
  location.includes('*') || location.includes('{') ? globToRegExp(location) : location;

export const adoptPath = (location: string, cwd: string): string => (cwd ? resolve(cwd, location) : location);

/**
 * "adapts" a given location (path or glob) into internal formal (absolute path or regexp)
 * @param location
 * @param cwd
 */
export const adoptLocation = (location: string | RegExp | undefined, cwd: string): string | RegExp | undefined =>
  typeof location === 'string' ? tryAsGlob(adoptPath(location, cwd)) : location;

const locationDefined = (location: string | RegExp | undefined): location is string | RegExp =>
  Boolean(location && location !== '*');

const matchRule = (location: string, rule: string | RegExp): boolean => {
  if (typeof rule === 'string') {
    return location === rule || location.startsWith(`${rule}${sep}`);
  }

  return Boolean(location.match(rule));
};

const allowDirectOrNested = (
  ruleTarget: string | RegExp,
  matchedIn: string,
  matchedOut: string,
  rule: Rule
): Rule | false => {
  if (typeof ruleTarget === 'string') {
    return false;
  }

  const matched = (matchedIn.match(ruleTarget) || [])[0];

  if (matchedOut.startsWith(matched)) {
    return false;
  }

  return rule;
};

export const matching = (rule: Rule, from: string, to: string): Rule | false => {
  // matching other folder
  if (locationDefined(rule.from) && !matchRule(from, rule.from)) {
    return false;
  }

  if (locationDefined(rule.to) && !matchRule(to, rule.to)) {
    return false;
  }

  // partial match, check for "nested" vs "anything"
  if (locationDefined(rule.from) && to.match(rule.from)) {
    return allowDirectOrNested(rule.from, from, to, rule);
  }

  if (locationDefined(rule.to) && from.match(rule.to)) {
    return allowDirectOrNested(rule.to, to, from, rule);
  }

  return rule;
};

export const adoptRules = (rules: RestrictionRule[], location: string, file: string): Rule[] => {
  if (!Array.isArray(rules)) {
    console.log('wrong configuration at', file, rules, 'are not array');
    throw new Error('rules are not array');
  }

  const errors = rules.map((rule) => RuleSchema.validate(rule)).filter(Boolean);

  if (errors.length) {
    console.error('at', file, ':\n', errors);
    throw new Error('Wrong Rule Schema');
  }

  return rules.map((originalRule) => ({
    ...originalRule,
    from: adoptLocation(originalRule.from, location),
    to: adoptLocation(originalRule.to, location),
    sourceRule: originalRule,
    file,
  }));
};

export const asAdoptedRules = (rules: RestrictionRule[], cwd: string): (() => Rule[]) => {
  const adopted = adoptRules(rules, cwd, 'eslint-config');

  return () => adopted;
};

export const relativePath = (
  path: string | RegExp | undefined,
  realPath: string | RegExp | undefined,
  cwd: string
): string => {
  if (locationDefined(path)) {
    if (typeof path === 'string') {
      return relative(cwd, path);
    }

    return String(realPath || path);
  }

  return 'Anywhere';
};
