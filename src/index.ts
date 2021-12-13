import { correctImportRule } from './rules/correct';
import { restrictionRule } from './rules/restrictions';

export const rules = {
  'correct-imports': correctImportRule,
  restrict: restrictionRule,
};
