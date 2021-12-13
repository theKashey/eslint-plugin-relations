import { extname } from 'path';

export const isRelative = (importPath: string): boolean => importPath.startsWith('.');
export const filename = (file: string): string => file.substr(0, file.length - extname(file).length);
