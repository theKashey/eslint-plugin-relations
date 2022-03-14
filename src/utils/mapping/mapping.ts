import { buildWordTrie, SearchWordTrie } from 'search-trie';

import { filename } from '../file';
import { fromTSConfig } from './from-tsconfig';
import { ConfigurationPathMapping, PathMapping } from './types';

export const resolveMapping = (options: {
  tsconfig?: string;
  pathMapping?: ConfigurationPathMapping;
}): PathMapping | undefined => {
  if (options.pathMapping) {
    return Object.entries(options.pathMapping);
  }

  if (options.tsconfig) {
    return fromTSConfig(options.tsconfig);
  }

  return undefined;
};

export const getMappingTrie = (options: {
  tsconfig?: string;
  pathMapping?: ConfigurationPathMapping;
}): SearchWordTrie<string> => {
  const uniMap = resolveMapping(options) || [];

  return buildWordTrie(
    uniMap.map(([k, v]) => {
      const path = filename(v);

      return {
        key: path.split('/'),
        value: k,
      };
    })
  );
};

export const getReverseMappingTrie = (options: {
  tsconfig?: string;
  pathMapping?: ConfigurationPathMapping;
}): SearchWordTrie<string> => {
  const uniMap = resolveMapping(options) || [];

  return buildWordTrie(
    uniMap.map(([k, v]) => {
      return {
        key: k.split('/'),
        value: v,
      };
    })
  );
};
