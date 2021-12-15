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
        {
          from: './d/*',
          type: 'restricted',
          message: 'isolation',
        },
        {
          to: './f/*',
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
      // can import nested `to`
      ruleForModule(
        {
          code: `
          import a from './any-b';          
          `,
          options,
        },
        join(process.cwd(), './b/anyfile.js')
      ),
      // can import nested `from`
      ruleForModule(
        {
          code: `
          import a from './any-c';          
          `,
          options,
        },
        join(process.cwd(), './c/index.js/anyfile.js')
      ),
    ],
    invalid: [
      ruleForModule(
        {
          code: `
          import a from './b';          
          `,
          options,
          errors: [
            'eslint-config: Importing `./b` is not allowed from `Anywhere` as it belong to `b`\n' + '💡"keep out"',
          ],
        },
        join(process.cwd(), './c.js')
      ),
      ruleForModule(
        {
          code: `
          import a from './any';          
          `,
          options,
          errors: [
            'eslint-config: Importing `./any` is not allowed from `c/index.js` as it belong to `Anywhere`\n' +
              '💡"isolation"',
          ],
        },
        join(process.cwd(), './c/index.js')
      ),
    ],
  });

  describe('glob', () => {
    ruleTester.run('restrictionRule-from-d', restrictionRule, {
      valid: [
        // matches specific file
        ruleForModule(
          {
            code: `
          import a from '../any-c';          
          `,
            options,
          },
          join(process.cwd(), './c/otherfile.js')
        ),
        ruleForModule(
          {
            code: `
          import a from '../a/file2.js';          
          `,
            options,
          },
          join(process.cwd(), './d/a/file.js')
        ),
      ],
      invalid: [
        // matches specific file
        ruleForModule(
          {
            code: `
          import a from '../any-c';          
          `,
            options,
            errors: [
              'eslint-config: Importing `../any-c` is not allowed from `./d/*` as it belong to `Anywhere`\n' +
                '💡"isolation"',
            ],
          },
          join(process.cwd(), './d/any-file.js')
        ),
        // matches specific file
        ruleForModule(
          {
            code: `
          import a from '../b/file.js';          
          `,
            options,
            errors: [
              'eslint-config: Importing `../b/file.js` is not allowed from `./d/*` as it belong to `Anywhere`\n' +
                '💡"isolation"',
            ],
          },
          join(process.cwd(), './d/a/file.js')
        ),
      ],
    });
  });

  ruleTester.run('restrictionRule-to-f', restrictionRule, {
    valid: [
      ruleForModule(
        {
          code: `
          import a from '../a/file2.js';          
          `,
          options,
        },
        join(process.cwd(), './f/a/file.js')
      ),
    ],
    invalid: [
      // matches specific file
      ruleForModule(
        {
          code: `
          import a from './any-c/other';          
          `,
          options,
          errors: [
            'eslint-config: Importing `./any-c/other` is not allowed from `Anywhere` as it belong to `./f/*`\n' +
              '💡"isolation"',
          ],
        },
        join(process.cwd(), './f/any-file.js')
      ),
      // matches specific file
      ruleForModule(
        {
          code: `
          import a from '../b/file.js';          
          `,
          options,
          errors: [
            'eslint-config: Importing `../b/file.js` is not allowed from `Anywhere` as it belong to `./f/*`\n' +
              '💡"isolation"',
          ],
        },
        join(process.cwd(), './f/a/file.js')
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
          errors: ['generator: Importing `./b` is not allowed from `Anywhere` as it belong to `b`\n' + '💡"keep out"'],
        },
        join(process.cwd(), './c.js')
      ),
    ],
  });
});
