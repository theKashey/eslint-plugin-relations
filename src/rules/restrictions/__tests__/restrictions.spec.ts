import { join } from 'path';

import { RuleTester } from 'eslint';

import { ruleForModule } from '../../../utils/test-utils';
import { restrictionRule } from '../restrictions';

describe('restrictionRule:rules', () => {
  const ruleTester = new RuleTester();
  const options = [
    {
      rules: [
        {
          to: './b',
          type: 'restricted',
          message: 'keep out',
        },
        {
          from: './c/index.js',
          type: 'restricted',
          message: 'isolation',
        },
      ],
    },
  ];

  ruleTester.run('restrictionRule', restrictionRule, {
    valid: [
      ruleForModule(
        {
          code: `
          import a from './c';          
          `,
          options,
        },
        join(process.cwd(), './c.js')
      ),
    ],
    invalid: [
      ruleForModule(
        {
          code: `
          import a from './b';          
          `,
          options,
          errors: ['Importing `./b` is not allowed from `Anywhere` as it belong to `b`\n' + '💡"keep out"'],
        },
        join(process.cwd(), './c.js')
      ),
      ruleForModule(
        {
          code: `
          import a from './any';          
          `,
          options,
          errors: ['Importing `./any` is not allowed from `c/index.js` as it belong to `Anywhere`\n' + '💡"isolation"'],
        },
        join(process.cwd(), './c/index.js')
      ),
    ],
  });
});

describe('restrictionRule:generator', () => {
  const ruleTester = new RuleTester();
  const options = [
    {
      ruleGenerator: (from: string, _to: string) => {
        return from.includes('c.js')
          ? [
              {
                to: './b',
                type: 'restricted',
                message: 'keep out',
              },
              {
                from: './c/index.js',
                type: 'restricted',
                message: 'isolation',
              },
            ]
          : [];
      },
    },
  ];

  ruleTester.run('restrictionRule', restrictionRule, {
    valid: [
      ruleForModule(
        {
          code: `
          import a from './c';          
          `,
          options,
        },
        join(process.cwd(), './c.js')
      ),
      ruleForModule(
        {
          code: `
          import a from './b';          
          `,
          options,
        },
        join(process.cwd(), './b.js')
      ),
    ],
    invalid: [
      ruleForModule(
        {
          code: `
          import a from './b';          
          `,
          options,
          errors: ['Importing `./b` is not allowed from `Anywhere` as it belong to `b`\n' + '💡"keep out"'],
        },
        join(process.cwd(), './c.js')
      ),
    ],
  });
});
