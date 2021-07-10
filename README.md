# [WIP] eslint-pligin-relations

Controls relationships between folders and packages

# Why

Because of Tick-Tack-Toe. Some packages should not have access to some other packages.
Some files should not have access to some other files:

- tests can use everything, nothing can use test
- everything can use core platform packages, core platform packages can use only other platform packages
- pages can use components, components cannot use pages

This creates a controllable _unidirectional flow_ and let you establish sound relationships
between different domains.

## Prerequisites

Your packages and/or code has to be separated in zones/buckets you will be able to configure relationships in between.
Having all packages in one folder will not work.

A good example of such separation can be found at [Lerna](https://github.com/lerna/lerna):

- commands
- core
- helpers
- utils

It can be already a good idea to restrict core usage(nobody can), as well as put a boundary around
helpers and utils - they should not use commands.

# Configuration

Can be configured in two ways:

## inside `eslint.rc`

```json
{
  //...
  'rule-monorepo-relations': [
    'error',
    {
      rules: [
        // platform cannot use packages
        {
          from: 'platform',
          to: 'packages',
          type: 'restricted',
          message: 'Let\'s keep them separated",
        }
      ]
    }
  ]
}
```

## See also

- [no-restricted-paths](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-restricted-paths.md) is very close to this one, with slightly different configuration and reporting, but the same idea

# Licence

MIT
