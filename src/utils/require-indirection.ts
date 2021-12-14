export const requireConfigurationFile = (filename: string) => {
  try {
    // check file existence. Return empty array if file does not exists
    require.resolve(filename);
  } catch (e) {
    return [];
  }

  return require(filename);
};
