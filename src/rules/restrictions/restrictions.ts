import type { Rule } from 'eslint';

import { isRelative } from '../../utils/file';
import { readRulesFromFileSystem } from './configuration-lookup';
import { resolveAbsolutePath } from './resolver';
import { matching, asAdoptedRules } from './utils';

export const restrictionRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',

    docs: {
      description: 'Establish relationships between different folders and imports',
      category: 'ECMAScript 6',
      recommended: false,
    },

    schema: [
      {
        type: 'object',
        properties: {
          ignoreRelative: { type: 'boolean', default: true },
          rules: {
            type: 'array',
            minItems: 0,
            items: {
              type: 'object',
              properties: {
                to: { type: 'string' },
                from: { type: 'string' },
                severity: { type: 'string' },
                type: { type: 'string' },
                message: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
          ruleGenerator: {
            type: 'function',
            default: readRulesFromFileSystem,
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      importRestricted: 'Importing `{{what}}` is not allowed from `{{from}}` as it belong to `{{to}}`',
      importRestrictedWithMessage:
        'Importing `{{what}}` is not allowed from `{{from}}` as it belong to `{{to}}`: {{message}}',
    },
  },
  create(context) {
    const pluginConfiguration = context.options[0] || {};
    const fromLocation = context.getFilename();
    const customRules = pluginConfiguration.rules;
    const ruleGenerator =
      pluginConfiguration.ruleGenerator || customRules
        ? asAdoptedRules(customRules, context.getCwd())
        : readRulesFromFileSystem;

    if (pluginConfiguration.rules && pluginConfiguration.resolveRules) {
      throw new Error('eslint-plugin-relations: rules and ruleGenerator cannot be used simultaneously.');
    }

    return {
      ImportDeclaration(node) {
        const imported = node.source.value as string;
        const relative = isRelative(imported);

        if (relative && pluginConfiguration.ignoreRelative) {
          return;
        }

        const toLocation = relative ? imported : resolveAbsolutePath(imported, context);

        if (toLocation) {
          for (const ruleSet of ruleGenerator([toLocation, fromLocation])) {
            for (const rule of ruleSet) {
              const result = matching(rule, fromLocation, toLocation);

              if (result) {
                if (result.type === 'restricted') {
                  context.report({
                    node,
                    messageId: result.message ? 'importRestrictedWithMessage' : 'importRestricted',
                    data: {
                      what: imported,
                      from: String(result.from || 'anywhere'),
                      to: String(result.to || 'anywhere'),
                      message: result.message,
                    },
                  });
                }

                return;
              }
            }
          }
        }
      },
    };
  },
};
