import { join } from 'path';

import { RuleTester } from 'eslint';
import { mocked } from 'ts-jest/utils';

import { requireConfigurationFile } from '../../../utils/require-indirection';
import { ruleForModule } from '../../../utils/test-utils';
import { restrictionRule } from '../restrictions';

jest.mock('../../../utils/require-indirection');

describe('restrictionRule:file-based', () => {
  const ruleTester = new RuleTester();
  const options = [{}];

  mocked(requireConfigurationFile).mockImplementation((file) => {
    switch (true) {
      case file.includes('a/.relations'):
        return [
          {
            to: './b',
            type: 'restricted',
            message: 'top control',
          },
        ];
      case file.includes('a/b/.relations'):
        return [
          {
            from: './a',
            to: './b',
            type: 'restricted',
            message: 'test2',
          },
        ];
      case file.includes('a/c/.relations'):
        return [
          {
            to: '../b',
            type: 'allowed',
            message: 'override',
          },
        ];
    }

    return [];
  });

  ruleTester.run('restrictionRule', restrictionRule, {
    valid: [
      ruleForModule(
        {
          code: `
          import a from './b';          
          `,
          options,
        },
        join(process.cwd(), './a/c/index.js')
      ),
      ruleForModule(
        {
          code: `
          import a from '../b';          
          `,
          options,
        },
        join(process.cwd(), './a/c/index.js')
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
            'a/.relations: Importing `./b` is not allowed from `Anywhere` as it belong to `a/b`\n' + '💡"top control"',
          ],
        },
        join(process.cwd(), './a/d.js')
      ),
    ],
  });
});
