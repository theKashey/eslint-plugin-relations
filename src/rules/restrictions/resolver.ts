import { realpathSync } from 'fs';

import type { Rule } from 'eslint';
// @ts-ignore
import resolve from 'eslint-module-utils/resolve';

const mappingCache: Record<string, string> = {};

export const resolveAbsolutePath = (path: string, context: Rule.RuleContext): string | undefined => {
  const resolved: string | undefined = resolve(path, context);

  if (!resolved) {
    return resolved;
  }

  if (!mappingCache[resolved]) {
    mappingCache[resolved] = realpathSync(resolved);
  }

  return mappingCache[resolved];
};
