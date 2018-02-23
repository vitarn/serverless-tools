# serverless-tools
Serverless toolbox

[![Build Status](https://travis-ci.org/vitarn/serverless-tools.svg?branch=master)](https://travis-ci.org/vitarn/serverless-tools)

## Install

`npm i serverless-tools`

## Examples

### handle

```js
const handle = require('serverless-tools/handle')

exports.hello = handle((req, res) => {
    res.send(`Hello ${req.query.name || 'Man'}!`)
})
```

### probe

```js
const probe = require('serverless-tools/probe')

console.log(probe)

{
    provider: 'aws',
    nodeEnv: 'production'
}
```

### setEnv

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
