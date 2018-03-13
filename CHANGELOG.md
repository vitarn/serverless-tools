# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.0.13"></a>
## [0.0.13](https://github.com/vitarn/serverless-tools/compare/v0.0.12...v0.0.13) (2018-03-13)



<a name="0.0.12"></a>
## [0.0.12](https://github.com/vitarn/serverless-tools/compare/v0.0.11...v0.0.12) (2018-03-13)



<a name="0.0.11"></a>
## [0.0.11](https://github.com/vitarn/serverless-tools/compare/v0.0.10...v0.0.11) (2018-03-13)


### Features

* add httpless req nodeEnv ([#23](https://github.com/vitarn/serverless-tools/issues/23)) ([dde272b](https://github.com/vitarn/serverless-tools/commit/dde272b))



<a name="0.0.10"></a>
## [0.0.10](https://github.com/vitarn/serverless-tools/compare/v0.0.9...v0.0.10) (2018-03-13)



<a name="0.0.9"></a>
## [0.0.9](https://github.com/vitarn/serverless-tools/compare/v0.0.6...v0.0.9) (2018-03-06)


### Bug Fixes

* **microless:** return error as json object default ([#21](https://github.com/vitarn/serverless-tools/issues/21)) ([0c09ecb](https://github.com/vitarn/serverless-tools/commit/0c09ecb))




v0.0.6 / 2018-03-03
===================

## New:
  1. Add `httpless`
  2. Add `microless`

  * Remove travis node4
  * Add microless

v0.0.5 / 2018-02-28
===================

  * Add travis stage deploy

v0.0.4 / 2018-02-27
===================

## Break:
  1. Don't stringify json in `handle` response

## New:
  1. Evaluate provider qcloud

  * Handle response don't stringify json
  * Evaluate understand qcloud

v0.0.3 / 2018-02-26
===================

## New:
  1. Add probe handler title

  * Add test for probe handler title
  * Add probe report title

v0.0.2 / 2018-02-26
===================

## New:
  1. Rename `probe` to `evaluate`
  2. The new `probe` report a full feature lists.
  3. Active [codecov](codecov.io)

  * Add more test
  * Generate inline source map
  * Update readme probe
  * Add more badge
  * Use npx install nyc and codecov in travis
  * Add codecov to travis
  * Refactor

v0.0.1 / 2018-02-24
===================

## New:
  1. handle
  2. probe
  3. setEnv

  * Update readme
  * Add npm script release
  * Use travis publish npm
  * Add handle helper
  * Detect provider by AWS_LAMBDA_FUNCTION_NAME
  * Add handle helper
  * Move env logic to probe
  * Improve env test
  * Add env module and test
  * Travis build master only
  * Add travis status into readme
  * Setup typescript
  * Add travis status into readme
  * Setup typescript
  * Add travis config
  * Initial commit
