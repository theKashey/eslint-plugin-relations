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

export const isVirtualLink = (filename: string): boolean =>
  filename.includes('.yarn/__virtual__/') && !filename.includes('/cache/');

export const resolveAbsolutePath = (
  path: string,
  context: Rule.RuleContext,
  mapping: SearchWordTrie<string>
): string | undefined => {
  const mappedResolution = tryMappedPath(path, mapping);

  if (mappedResolution) {
    return mappedResolution;
  }

  const resolved: string | undefined = resolve(path, context);

  if (!resolved) {
    return resolved;
  }

  // decode symlink to a real path
  if (!mappingCache[resolved]) {
    mappingCache[resolved] = realpathSync(resolved);
  }

  return mappingCache[resolved];
};
