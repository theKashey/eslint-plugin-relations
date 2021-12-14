import { resolve, relative } from 'path';

import { Rule, RuleSchema } from './types';

export const adoptLocation = (location: string | RegExp, cwd: string): string | RegExp =>
  typeof location === 'string' ? resolve(cwd, location) : location;

const locationDefined = (location: string | RegExp): boolean => Boolean(location && location !== '*');

export const matching = (rule: Rule, from: string, to: string): Rule | false => {
  if (locationDefined(rule.from) && !from.match(rule.from)) {
    return false;
  }

  if (locationDefined(rule.to) && !to.match(rule.to)) {
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

export const relativePath = (path: string | RegExp, cwd: string): string => {
  if (locationDefined(path)) {
    if (typeof path === 'string') {
      return relative(cwd, path);
    }

    return String(path);
  }

  return 'Anywhere';
};
