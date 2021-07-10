import { resolve } from 'path';

import { Rule, RuleSchema } from './types';

export const isRelative = (importPath: string): boolean => importPath.startsWith('.');

export const adoptLocation = (location: string | RegExp, cwd: string): string | RegExp =>
  typeof location === 'string' ? resolve(cwd, location) : location;

export const matching = (rule: Rule, from: string, to: string): Rule | false => {
  if (rule.from && !from.match(rule.from)) {
    return false;
  }

  if (rule.to && !to.match(rule.to)) {
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

export const asAdoptedRules = (rules: Rule[]) => {
  const adoped = [adoptRules(rules, process.cwd(), 'eslint.rc')];

  return () => adoped;
};
