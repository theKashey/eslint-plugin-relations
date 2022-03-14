import { realpathSync } from 'fs';

import type { Rule } from 'eslint';
// @ts-ignore
import resolve from 'eslint-module-utils/resolve';
import { SearchWordTrie } from 'search-trie';

const mappingCache: Record<string, string> = {};

export const tryMappedPath = (path: string, mapping: SearchWordTrie<string>): string | undefined => {
  const search = mapping.findNearest(path.split('/'));

  if (search && search.value) {
    return search.value;
  }

  return undefined;
};

export const resolveAbsolutePath = (
  path: string,
  context: Rule.RuleContext,
  mapping: SearchWordTrie<string>
): string | undefined => {
  const resolved: string | undefined = tryMappedPath(path, mapping) || resolve(path, context);

  if (!resolved) {
    return resolved;
  }

  if (!mappingCache[resolved]) {
    mappingCache[resolved] = realpathSync(resolved);
  }

  return mappingCache[resolved];
};
