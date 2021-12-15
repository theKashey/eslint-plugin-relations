import { resolve, relative } from 'path';

import { globToRegExp } from '../../utils/glob-to-regex';
import { SourceRule, RuleSchema, Rule } from './types';

const tryAsGlob = (location: string): RegExp | string =>
  location.includes('*') || location.includes('(') ? globToRegExp(location) : location;

const adoptLocation = (location: string | RegExp | undefined, cwd: string): string | RegExp | undefined =>
  typeof location === 'string' ? tryAsGlob(resolve(cwd, location)) : location;

const locationDefined = (location: string | RegExp | undefined): location is string | RegExp =>
  Boolean(location && location !== '*');

export const matching = (rule: Rule, from: string, to: string): Rule | false => {
  // matching other folder
  if (locationDefined(rule.from) && !from.match(rule.from)) {
    return false;
  }

  if (locationDefined(rule.to) && !to.match(rule.to)) {
    return false;
  }

  // partial match, check for "nested" vs "anything"
  if (locationDefined(rule.from) && to.match(rule.from)) {
    if (typeof rule.from === 'string') {
      return false;
    }

    const matched = (from.match(rule.from) || [])[0];

    if (to.includes(matched)) {
      return false;
    }
  }

  if (locationDefined(rule.to) && from.match(rule.to)) {
    if (typeof rule.to === 'string') {
      return false;
    }

    const matched = (to.match(rule.to) || [])[0];

    if (from.includes(matched)) {
      return false;
    }
  }

  return rule;
};

export const adoptRules = (rules: SourceRule[], location: string, file: string): Rule[] => {
  if (!Array.isArray(rules)) {
    console.log('wrong configuration at', file, rules, 'are not array');
    throw new Error('rules are not array');
  }

  const error = rules.map((rule) => RuleSchema.validate(rule)).filter(Boolean);

  if (error.length) {
    console.error('at', file, ':\n', error.join('\n'));
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

export const asAdoptedRules = (rules: SourceRule[], cwd: string): (() => Rule[]) => {
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
