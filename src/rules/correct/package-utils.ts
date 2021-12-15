import { dirname, resolve } from 'path';

import findUp from 'find-up';

const findNearestPackageBoundary = (sourceFile: string): string => {
  const packageFile = findUp.sync('package.json', { cwd: dirname(sourceFile) })!;
  const packageData = require(packageFile);

  if (packageData.name) {
    return packageFile;
  } else {
    return findNearestPackageBoundary(dirname(packageFile));
  }
};

/**
 * file is defined inside the current package
 */
export const isLocal = (importPath: string, sourceFile: string): boolean => {
  const nearestPackageLocation = dirname(findNearestPackageBoundary(sourceFile));
  const baseName = dirname(resolve(dirname(sourceFile), importPath));

  return baseName.includes(nearestPackageLocation);
};
