import type { Rule } from 'eslint';

import { isRelative } from '../../utils/file';
import { readRulesFromFileSystem } from './configuration-lookup';
import { resolveAbsolutePath } from './resolver';
import { matching, asAdoptedRules, relativePath } from './utils';

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
          ignoreRelative: {
            description: 'ignores any relative imports. Recommended feature for package-only linting',
            type: 'boolean',
            default: false,
          },
          rules: {
            type: 'array',
            minItems: 0,
            items: {
              type: 'object',
              properties: {
                to: { type: ['string', 'object'] },
                from: { type: ['string', 'object'] },
                // severity: {type: 'string'},
                type: { type: 'string', enum: ['restricted', 'allowed'] },
                message: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
          ruleGenerator: {
            description: 'total override for rule generator',
            type: 'function',
            default: undefined,
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      importRestricted: 'Importing `{{what}}` is not allowed from `{{from}}` as it belong to `{{to}}`',
      importRestrictedWithMessage:
        'Importing `{{what}}` is not allowed from `{{from}}` as it belong to `{{to}}`\n💡"{{message}}"',
    },
  },
  create(context) {
    const pluginConfiguration = context.options[0] || {};
    const fromLocation = context.getFilename();
    const customRules = pluginConfiguration.rules;
    const cwd = context.getCwd();
    const ruleGenerator =
      pluginConfiguration.ruleGenerator || (customRules ? asAdoptedRules(customRules, cwd) : readRulesFromFileSystem);

    if (pluginConfiguration.rules && pluginConfiguration.ruleGenerator) {
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
                      from: relativePath(result.from, cwd),
                      to: relativePath(result.to, cwd),
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
