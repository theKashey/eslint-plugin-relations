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

const sortMapping = (pathMapping: PathMapping): PathMapping =>
  pathMapping.sort(([key1], [key2]) => key2.length - key1.length);

export const getMappingTrie = (options: {
  tsconfig?: string;
  pathMapping?: ConfigurationPathMapping;
}): SearchWordTrie<string> => {
  const uniMap = sortMapping(resolveMapping(options) || []);

  return buildWordTrie(
    uniMap.map(([k, v]) => ({
      key: filename(v).split('/'),
      value: k,
    }))
  );
};

export const getReverseMappingTrie = (
  options: {
    tsconfig?: string;
    pathMapping?: ConfigurationPathMapping;
  },
  { extractFile }: { extractFile?: boolean } = {}
): SearchWordTrie<string> => {
  const uniMap = sortMapping(resolveMapping(options) || []);

  return buildWordTrie(
    uniMap.map(([k, v]) => ({
      key: k.split('/'),
      value: extractFile ? filename(v) : v,
    }))
  );
};
