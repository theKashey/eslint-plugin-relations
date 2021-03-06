import { dirname, join, relative } from 'path';

import { requireConfigurationFile } from '../../utils/require-indirection';
import { Rule, RestrictionRule } from './types';
import { adoptRules } from './utils';

const loadRules = (location: string, mask: string): Rule[] | null => {
  if (!location) {
    return null;
  }

  const file = join(location, mask);

  return adoptRules(requireConfigurationFile(file), location, relative(process.cwd(), file));
};

const ruleCache: Record<string, Rule[] | null> = {};

const cachedLookup = (location: string, mask: string, matches: Array<[string, RestrictionRule[]]>) => {
  if (location === '/') {
    return;
  }

  const rules = location in ruleCache ? ruleCache[location] : loadRules(location, mask);
  ruleCache[location] = rules;

  if (rules && rules.length) {
    matches.push([location, rules]);
  }

  cachedLookup(dirname(location), mask, matches);
};

export const readRulesFromFileSystem = (from: string, to: string, mask = '.relations'): Rule[] => {
  const matches: Array<[string, Rule[]]> = [];
  [dirname(from), dirname(to)].forEach((location) => cachedLookup(location, mask, matches));

  return matches
    .sort((a, b) => b[0].length - a[0].length)
    .map((x) => x[1])
    .reduce((acc, items) => {
      acc.push(...items);

      return acc;
    }, []);
};
