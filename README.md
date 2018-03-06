# Serverless Toolboxs

[![Serverless][ico-serverless]][link-serverless]
[![License][ico-license]][link-license]
[![NPM][ico-npm]][link-npm]
[![Build Status][ico-build]][link-build]
[![Coverage Status][ico-codecov]][link-codecov]
[![Greenkeeper badge][ico-greenkeeper]][link-greenkeeper]

Serverless toolbox

## Install

`npm i serverless-tools`

## Examples

### httpless

A more node-style way to write your handler functions.

```js
const httpless = require('serverless-tools/httpless')

exports.hello = httpless((req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.end(`Hello ${req.query.name || 'gays'}! -- Provide by ${req.provider}`)
})

{
    statusCode: 200,
    headers: {
        'content-type': 'text/plain'
    },
    body: 'Hello gays! -- Provide by aws'
}
```

### microless

A [micro][link-micro]-style way to write your handler functions.

```js
const microless = require('serverless-tools/microless')
const { json, send, sendError, createError } = microless

exports.hello = microless(() => {
    return 'Hello world'
})

exports.ok = microless((req, res) => {
    send(res, 200, { message: 'ok' })
})

exports.auth = microless((req, res) => {
    if (!auth(req)) throw createError(401, 'Must signin first')
    send(res, 200, 'welcome')
})

exports.download = microless((req, res) => {
    if (limited) {
        const err = new Error('Bandwidth limit exceeded')
        err.status = 509
        err.expose = true
        sendError(req, res, err)
        return
    }

    send(res, 200, base64Content)
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
[ico-greenkeeper]: https://badges.greenkeeper.io/vitarn/serverless-tools.svg

[link-serverless]: http://www.serverless.com/
[link-license]: ./blob/master/LICENSE
[link-npm]: https://www.npmjs.com/package/serverless-tools
[link-build]: https://travis-ci.org/vitarn/serverless-tools
[link-codecov]: https://codecov.io/gh/vitarn/serverless-tools
[link-greenkeeper]: https://greenkeeper.io/

[link-micro]: https://github.com/zeit/micro
