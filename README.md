# serverless-tools
Serverless toolbox

[![Build Status](https://travis-ci.org/vitarn/serverless-tools.svg?branch=master)](https://travis-ci.org/vitarn/serverless-tools)

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
