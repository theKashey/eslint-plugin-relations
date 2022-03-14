import fs from 'fs';

import json5 from 'json5';

import { PathMapping } from './types';

type ImportsRef = Record<string, string[]>;
type ImportsMap = Array<[string, string[]]>;

const uniqueList = (entities: ImportsMap): PathMapping =>
  // ->
  Object.entries(
    // value : key
    Object.fromEntries(entities.map(([a, b]) => [b[0], a]))
  ) // key:value
    .map(([a, b]) => [b, a] as [string, string]);

export const fromTSConfig = (configFile: string): PathMapping => {
  const configuration = json5.parse(fs.readFileSync(configFile, 'utf-8'));
  const entryPoints = configuration.compilerOptions.paths as ImportsRef;

  if (!entryPoints) {
    throw new Error('compilerOptions.paths is not defined');
  }

  return uniqueList(Object.entries(entryPoints));
};
