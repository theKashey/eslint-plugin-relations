import { resolve } from 'path';

import { RuleTester } from 'eslint';

import { ruleForModule } from '../../../utils/test-utils';
import { correctImportRule } from '../correct-imports';

describe('correct-imports', () => {
  const ruleTester = new RuleTester();
  const options = [
    {
      pathMapping: {
        a: 'a',
        'a/a': 'a/a',
      },
    },
  ];

  ruleTester.run('correct-imports', correctImportRule, {
    valid: [
      ruleForModule(
        {
          code: `
          import a from 'a';
          import aa from 'a/a';
          `,
          options,
        },
        'c.js'
      ),
    ],
    invalid: [
      ruleForModule(
        {
          code: `
          import a from 'a/b';          
          `,
          options,
          errors: ["Package 'a/b' should be imported as 'a'"],
        },
        'b.js'
      ),
      ruleForModule(
        {
          code: `
          import a from '../c';          
          `,
          options,
          errors: [
            `Package '../c' cannot be found. Tried absolute path: ${resolve(
              process.cwd(),
              '../c'
            )}. Check or update configuration source`,
          ],
        },
        'b.js'
      ),
    ],
  });
});
