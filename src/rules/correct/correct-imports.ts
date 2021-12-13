//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

import { resolve, dirname } from 'path';

import { Rule } from 'eslint';
import { buildWordTrie, SearchWordTrie } from 'search-trie';

import { filename, isRelative } from '../../utils/file';
import { fromTSConfig } from './from-tsconfig';
import { isLocal } from './package-utils';
import { PathMapping } from './types';

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

const getMapping = (options: { tsconfig?: string; pathMapping?: PathMapping }): PathMapping => {
  if (options.pathMapping) {
    return options.pathMapping;
  }

  if (options.tsconfig) {
    return fromTSConfig(options.tsconfig);
  }

  throw new Error('relations/correct requires of `tsconfig` or `pathMapping` configuration');
};

export const correctImportRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
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
            required: false,
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
      importNotResolved:
        "Path '{{what}}' cannot be found. Tried absolute path: {{how}}. Check or update configuration source",
    },
  },
  create(context) {
    const pluginConfiguration = context.options[0] || {};
    const { autofix, tsconfig, pathMapping } = pluginConfiguration;

    const uniMap = getMapping({ tsconfig, pathMapping });

    const currentFile = context.getFilename();

    const fileTrie = buildWordTrie(
      uniMap.map(([k, v]) => {
        const path = filename(v);

        return {
          key: path.split('/'),
          value: k,
        };
      })
    );
    const pathToName = buildWordTrie(
      uniMap.map(([k, v]) => ({
        key: v.split('/'),
        value: k,
      }))
    );
    const nameToPath = buildWordTrie(
      uniMap.map(([k, v]) => ({
        key: k.split('/'),
        value: v,
      }))
    );

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
            findReference(resolve(dirname(currentFile), imported), fileTrie)
          : // handle absolute imports, other-packages/src/private-stuff
            findReference(
              // decode name -> file -> name
              findReference(imported, nameToPath) || '',
              pathToName
            );

        // importing something from outside, but path cannot be resolved
        if (!ref && isRelativeImport) {
          context.report({
            node,
            messageId: 'importNotResolved',
            data: { what: imported, how: resolve(dirname(currentFile), imported) },
          });
        }

        // path found, but need to be fixed
        if (ref && ref !== imported) {
          const fixer = (fixer: Rule.RuleFixer) => fixer.replaceText(node.source, `"${ref}"`);

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
