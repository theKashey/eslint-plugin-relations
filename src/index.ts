import { correctImportRule } from './rules/correct';
import { restrictionRule } from './rules/restrictions';

export type { Rule as RestrictionRule } from './rules/restrictions/types';

export const rules = {
  'correct-imports': correctImportRule,
  restrict: restrictionRule,
};
