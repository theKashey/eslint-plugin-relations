export const requireConfigurationFile = (filename: string) => {
  try {
    return require(filename);
  } catch (e) {
    return [];
  }
};
