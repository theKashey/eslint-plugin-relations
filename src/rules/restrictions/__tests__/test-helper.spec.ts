import { resolveRelation } from '../test-helper';
import { RestrictionRule } from '../types';

describe('restrictionRule:helper', () => {
  const rules: RestrictionRule[] = [
    {
      to: './b/',
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
  ];

  it('handles logic via test helper', () => {
    expect(
      resolveRelation('./anywhere', './b', {
        rules,
      })?.type
    ).toBe('restricted');

    expect(
      resolveRelation('./anywhere', './b-other', {
        rules,
      })?.type
    ).toBe(undefined);

    expect(
      resolveRelation('./d/something', './anywhere', {
        rules,
      })?.type
    ).toBe('restricted');
  });
});
