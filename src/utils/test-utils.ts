export const ruleForModule = <T extends Record<any, any>>(t: T, FILENAME: string): T => {
  return Object.assign(
    {
      filename: FILENAME,
    },
    t,
    {
      parserOptions: Object.assign(
        {
          sourceType: 'module',
          ecmaVersion: 9,
        },
        t.parserOptions
      ),
    }
  );
};
