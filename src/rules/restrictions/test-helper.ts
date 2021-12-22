import { readRulesFromFileSystem } from './configuration-lookup';
import { RuleGenerator, RestrictionRule } from './types';
import { adoptPath, asAdoptedRules, matching } from './utils';

type Options = {
  cwd?: string;
} & (
  | {
      rules: RestrictionRule[];
      ruleGenerator?: never;
    }
  | {
      ruleGenerator: RuleGenerator;
      rules?: never;
    }
  | {
      ruleGenerator?: never;
      rules?: never;
    }
);

/**
 * a test helper for relation-restrict rule.
 *
 * Note: paths will be resolved relative process.cwd. You might need to pre-resolve them, as long as they are expected to be absolute
 * @example
 * ```ts
 * testRelation('packages/common','packages/pages', {rules}) => rule from provided ones
 * testRelation('packages/common','packages/pages', {ruleGenerator}) => rule from provided ruleGenerator
 * testRelation('packages/common','packages/pages', {}) => rule from `.relation` files
 * ```
 */
export const resolveRelation = (
  from: string,
  to: string,
  pluginConfiguration: Options
): RestrictionRule | undefined => {
  const cwd = pluginConfiguration.cwd ?? process.cwd();
  const ruleGenerator =
    pluginConfiguration.ruleGenerator ||
    (pluginConfiguration.rules ? asAdoptedRules(pluginConfiguration.rules, cwd) : readRulesFromFileSystem);

  const fromLocation = adoptPath(from, cwd);
  const toLocation = adoptPath(to, cwd);

  const rules = ruleGenerator(fromLocation, toLocation);

  for (const rule of rules) {
    const result = matching(rule, fromLocation, toLocation);

    if (result) {
      return result.sourceRule;
    }
  }

  return undefined;
};
