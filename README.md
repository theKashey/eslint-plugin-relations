# [WIP] eslint-plugin-relations

Controls relationships between folders and packages in a monorepo environment.

# Provided rules

- `relations/correct` - to autocorrect imports to only allowed paths.
- `relations/restrictions` - to establish _controlled relationships_ between different places of your application

# Correct

## Why

Because an `autoimport` feature you IDE might provide is not always working. It might result with a:

- relative import, not using package name as it should
- access "src" folder, or anything else it should not

`correct` rule will restrict all imports to the explicitly defined ones, autocorrecting (trimming) anything else

## Configuration

### inside `eslintrc.js`

```json
{
  //...
  "relations/correct": [
    "error",
    {
      // if you use another tool to derive package->path mapping for typescript
      "tsconfig": "path-to-your-config",
      // the one with `"compilerOptions": { "paths": [...] }

      // OR
      // explicit mapping to use
      "pathMapping": {
        "packageName": "path"
      },
      // controls "suggestion" over "autofix" behavior
      // you want this to be 'false' during development and 'true' in precommit
      "autofix": false
    }
  ]
}
```

# Restrictions

## Why

Because of [Tic-Tac-Toe](https://en.wikipedia.org/wiki/Tic-tac-toe)
, [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter)
, [Abstraction Layers](https://en.wikipedia.org/wiki/Abstraction_layer)
and [Hexagonal Architecture](https://en.wikipedia.org/wiki/Multitier_architecture).

- Some functionality should not know about some other functionality.
- Some packages should not have access to some other packages.
- Some files should not have access to some other files:

Examples:

- tests can use everything, nothing can use test. (tests are not a part of your application, your application is a part
  of your tests)
- everything can use core platform packages, core platform packages can use only other platform packages (you use
  platform, not the other way around)
- pages can use components, components cannot use pages (the same as above)

This creates a controllable _unidirectional flow_ and let you establish sound relationships between different domains.

## Prerequisites

Your packages and/or code has to be separated in zones/buckets you will be able to configure relationships in between.
Having all packages in one folder will not work.

A good example of such separation can be found at [Lerna](https://github.com/lerna/lerna):

- commands
- core
- helpers
- utils

It can be already a good idea to restrict core usage(nobody can), as well as put a boundary around helpers and utils -
they should not use commands.

## Configuration

Can be configured in two ways:

### inside `eslint.rc`

```json
{
  //...
  'relations/restrictions': [
    'error',
    {
      rules: [
        // platform cannot use packages
        {
          // absolute folder
          from: 'platform',
          // absolute folder
          to: 'packages',
          type: 'restricted',
          message: 'Let\'s keep them separated'
        },
        // "allow" rules should precede "restrict" ones
        {
          from: /__tests__/,
          to: /__tests__/,
          // allow tests to access tests
          type: 'allowed',
          message: 'do not import from tests'
        },
        {
          // anywhere
          from: '*',
          //relative folder
          to: /__tests__/,
          type: 'restricted',
          message: 'do not import from tests'
        },
      ]
    }
  ]
}
```

### See also

- [no-restricted-paths](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-restricted-paths.md)
  is very close to this one, with slightly different configuration and reporting, but the same idea
- [depcheck](https://github.com/depcheck/depcheck) - we strongly recommend using `depcheck` to keep your package
  relations up-to-date.

# Licence

MIT
