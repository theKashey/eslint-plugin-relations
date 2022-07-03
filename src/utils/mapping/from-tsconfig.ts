import fs from 'fs';

import json5 from 'json5';

import { PathMapping } from './types';

type ImportsRef = Record<string, string[]>;

export const mapEntrypoints = (entryPoints: ImportsRef): PathMapping =>
  Object.entries(entryPoints).map(([name, folders]) => [name, folders[0]]);

export const fromTSConfig = (configFile: string): PathMapping => {
  const configuration = json5.parse(fs.readFileSync(configFile, 'utf-8'));
  const entryPoints = configuration.compilerOptions.paths as ImportsRef;

  if (!entryPoints) {
    throw new Error('compilerOptions.paths is not defined');
  }

  return mapEntrypoints(entryPoints);
};
