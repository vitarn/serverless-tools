# serverless-tools

[![Serverless][ico-serverless]][link-serverless]
[![License][ico-license]][link-license]
[![NPM][ico-npm]][link-npm]
[![Build Status][ico-build]][link-build]
[![Coverage Status][ico-codecov]][link-codecov]

Serverless toolbox

## Install

`npm i serverless-tools`

## Examples

### handle

A more node-style way to write your handler functions.

```js
const handle = require('serverless-tools/handle')

exports.hello = handle((req, res) => {
    res.send(`Hello ${req.query.name || 'Man'}!`)
})
```

### probe

Generate a report for serverless function runtime environment.

```js
const probe = require('serverless-tools/probe')

console.log(probe())

{
    os: { },
    process: {
        env: { },
    },
    'aws-sdk': { },
}
```

### evaluate

Evaluate runtime feature and guess possible env.

```js
const evaluate = require('serverless-tools/evaluate')

console.log(evaluate())

{
    provider: 'aws',
    nodeEnv: 'production'
}
```

Write evaluate envs into `process.env`. This side effect happend immediately.

```js
require('serverless-tools/setEnv')

console.log(process.env)

{
    ...
    PROVIDER: 'aws',
    NODE_ENV: 'production',
    ...
}
```

[ico-serverless]: http://public.serverless.com/badges/v3.svg
[ico-license]: https://img.shields.io/github/license/vitarn/serverless-tools.svg
[ico-npm]: https://img.shields.io/npm/v/serverless-tools.svg
[ico-build]: https://travis-ci.org/vitarn/serverless-tools.svg?branch=master
[ico-codecov]: https://codecov.io/gh/vitarn/serverless-tools/branch/master/graph/badge.svg

[link-serverless]: http://www.serverless.com/
[link-license]: ./blob/master/LICENSE
[link-npm]: https://www.npmjs.com/package/serverless-tools
[link-build]: https://travis-ci.org/vitarn/serverless-tools
[link-codecov]: https://codecov.io/gh/vitarn/serverless-tools
