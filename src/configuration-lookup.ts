import { dirname, join } from 'path';

import { Rule } from './types';
import { adoptRules } from './utils';

const loadRules = (location: string, mask: string): Rule[] | null => {
  if (!location) {
    return null;
  }

  const file = join(location, mask);

  try {
    return adoptRules(require(file), location, file);
  } catch (e) {
    return [];
  }
};

const ruleCache: Record<string, Rule[] | null> = {};

const cachedLookup = (location: string, mask: string, matches: Rule[][]) => {
  const rules = location in ruleCache ? ruleCache[location] : loadRules(location, mask);
  ruleCache[location] = rules;

  if (rules !== null) {
    cachedLookup(dirname(location), mask, matches);
    matches.push(rules);
  }
};

export const readRulesFromFileSystem = (locations: string[], mask = '.relations'): Rule[][] => {
  const matches: Rule[][] = [];
  locations.forEach((location) => cachedLookup(location, mask, matches));

  return matches;
};
