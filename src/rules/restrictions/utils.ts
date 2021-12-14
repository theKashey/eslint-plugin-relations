import { resolve, relative } from 'path';

import { Rule, RuleSchema } from './types';

export const adoptLocation = (location: string | RegExp | undefined, cwd: string): string | RegExp | undefined =>
  typeof location === 'string' ? resolve(cwd, location) : location;

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
  if (locationDefined(rule.from) && !locationDefined(rule.to) && to.match(rule.from)) {
    return false;
  }

  if (locationDefined(rule.to) && !locationDefined(rule.from) && from.match(rule.to)) {
    return false;
  }

  return rule;
};

export const adoptRules = (rules: Rule[], location: string, file: string): Rule[] => {
  const error = rules.map((rule) => RuleSchema.validate(rule)).filter(Boolean);

  if (error.length) {
    console.error('at', file, ':\n', error.join('\n'));
    throw new Error('Wrong Rule Schema');
  }

  return rules.map((originalRule) => ({
    ...originalRule,
    from: adoptLocation(originalRule.from, location),
    to: adoptLocation(originalRule.to, location),
  }));
};

export const asAdoptedRules = (rules: Rule[], cwd: string): (() => Rule[]) => {
  const adopted = adoptRules(rules, cwd, 'eslintrc');

  return () => adopted;
};

export const relativePath = (path: string | RegExp | undefined, cwd: string): string => {
  if (locationDefined(path)) {
    if (typeof path === 'string') {
      return relative(cwd, path);
    }

    return String(path);
  }

  return 'Anywhere';
};
