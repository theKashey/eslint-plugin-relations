//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

import { resolve, dirname } from 'path';

import { Rule } from 'eslint';
import { SearchWordTrie } from 'search-trie';

import { isRelative } from '../../utils/file';
import { getMappingTrie, resolveMapping } from '../../utils/mapping';
import { getReverseMappingTrie } from '../../utils/mapping/mapping';
import { ConfigurationPathMapping } from '../../utils/mapping/types';
import { isLocal } from './package-utils';

type WordTrie = SearchWordTrie<string>;

/**
 * finds nearest reference in the trie
 */
const findReference = (absolutePath: string, lookUp: WordTrie): string | undefined => {
  const found = lookUp.findNearest(absolutePath.split('/'));

  if (found) {
    return found.value as string;
  }

  return undefined;
};

const assertMapping = (options: { tsconfig?: string; pathMapping?: ConfigurationPathMapping }) => {
  const mapping = resolveMapping(options);

  if (!mapping) {
    throw new Error('relations/correct requires of `tsconfig` or `pathMapping` configuration');
  }
};

export const correctImportRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    fixable: 'code',

    docs: {
      description: 'enforces correct imports',
      category: 'ECMAScript 6',
      recommended: false,
    },

    schema: [
      {
        type: 'object',
        properties: {
          autofix: {
            description: "Controls 'fix over suggest' behavior.",
            type: 'boolean',
            default: false,
          },
          tsconfig: {
            description: 'A path to tsconfig file.',
            type: 'string',
          },
          pathMapping: {
            description: "a mapping between a 'name' and a 'path'",
            type: 'object',
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      importShouldUseLocalName: "Package '{{what}}' should be imported as '{{how}}'",
      absoluteImportNotResolved: "Package '{{what}}' cannot be found. Check or update configuration source",
      relativeImportNotResolved:
        "Package '{{what}}' cannot be found. Tried absolute path: {{how}}. Check or update configuration source",
    },
  },
  create(context) {
    const pluginConfiguration = context.options[0] || {};
    const { autofix, tsconfig, pathMapping } = pluginConfiguration;

    const options = { tsconfig, pathMapping };
    assertMapping(options);

    const currentFile = context.getFilename();

    const pathToName = getMappingTrie(options);
    const nameToPath = getReverseMappingTrie(options);

    return {
      ImportDeclaration(node) {
        const imported = node.source.value as string;
        const isRelativeImport = isRelative(imported);

        // do nothing if we are importing file inside own package
        if (isRelativeImport && isLocal(imported, currentFile)) {
          // file is not relative or is local
          return;
        }

        const ref = isRelativeImport
          ? // handle relative non-local files, like ../../other-package/stuff
            findReference(resolve(dirname(currentFile), imported), pathToName)
          : // handle absolute imports, other-packages/src/private-stuff
            findReference(
              // decode name -> file -> name
              findReference(imported, nameToPath) || '',
              pathToName
            );

        if (!ref) {
          // importing something from outside, but path cannot be resolved
          if (isRelativeImport) {
            context.report({
              node,
              messageId: 'relativeImportNotResolved',
              data: { what: imported, how: resolve(dirname(currentFile), imported) },
            });
          } else {
            return;
            // do not report unknown paths. Just skip
            // context.report({
            //   node,
            //   messageId: 'absoluteImportNotResolved',
            //   data: { what: imported },
            // });
          }

          return;
        }

        // path found, but need to be fixed
        if (ref && ref !== imported) {
          const q = node.source.raw![0];
          const fixer = (fixer: Rule.RuleFixer) => fixer.replaceText(node.source, `${q}${ref}${q}`);

          context.report({
            node,
            messageId: 'importShouldUseLocalName',
            data: { what: imported, how: ref },
            fix: autofix ? fixer : undefined,
            suggest: [
              {
                desc: `Rewire import to ${ref}.`,
                fix: fixer,
              },
            ],
          });
        }
      },
    };
  },
};
