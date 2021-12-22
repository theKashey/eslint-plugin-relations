import { correctImportRule } from './rules/correct';
import { restrictionRule } from './rules/restrictions';

export { resolveRelation } from './rules/restrictions/test-helper';
export { adoptLocation } from './rules/restrictions';

export type { RestrictionRule as RestrictionRule } from './rules/restrictions/types';

export const rules = {
  'correct-imports': correctImportRule,
  restrict: restrictionRule,
};
