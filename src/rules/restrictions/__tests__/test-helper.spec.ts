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

  it('glob-test', () => {
    expect(
      resolveRelation('./a', './test/b', {
        rules: [
          {
            to: 'test/{b,c}',
            type: 'restricted',
          },
        ],
      })?.type
    ).toBe('restricted');
  });

  it('relative test', () => {
    const rules: RestrictionRule[] = [
      {
        to: '.',
        from: './*',
        type: 'allowed',
      },
      {
        to: '.',
        type: 'restricted',
      },
    ];

    expect(
      resolveRelation('../external-folder', './b', {
        rules,
      })?.type
    ).toBe('restricted');

    expect(
      resolveRelation('./anywhere-inside', './other-place-iside', {
        rules,
      })?.type
    ).toBe('allowed');
  });

  describe('external-mapping', () => {
    it('case default', () => {
      expect(
        resolveRelation('./a', 'package-b', {
          rules: [
            {
              to: './b',
              type: 'restricted',
            },
          ],
        })?.type
      ).toBe(undefined);
    });

    it('mapped', () => {
      expect(
        resolveRelation('./a', 'package-b', {
          rules: [
            {
              to: './b',
              type: 'restricted',
            },
          ],
          pathMapping: { 'package-b': './b' },
        })?.type
      ).toBe('restricted');
    });
  });
});
