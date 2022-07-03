import { mapEntrypoints } from '../from-tsconfig';

describe('from-ts-config', () => {
  it('maps to know mapping', () => {
    expect(
      mapEntrypoints({
        'service/meta': ['workspace/packages/services/meta'],
        'service/meta/types': ['workspace/packages/services/meta/types.ts'],
      })
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          "service/meta",
          "workspace/packages/services/meta",
        ],
        Array [
          "service/meta/types",
          "workspace/packages/services/meta/types.ts",
        ],
      ]
    `);
  });
});
