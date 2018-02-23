import test from 'ava'
import {
    setupEnv_PROVIDER, setupEnv_NODE_ENV,
} from '../env/env'

test('setupEnv_PROVIDER aws', t => {
    const env = Object.assign({}, process.env)
    t.falsy(env.PROVIDER)

    env.AWS_REGION = 'cn-north-1'
    setupEnv_PROVIDER(env)
    t.is(env.PROVIDER, 'aws')
})

test('setupEnv_NODE_ENV test', t => {
    const env = Object.assign({}, process.env)
    setupEnv_NODE_ENV(env)
    t.is(env.NODE_ENV, 'test')
})

test('setupEnv_NODE_ENV default production', t => {
    const env = Object.assign({}, process.env)
    delete env.NODE_ENV
    setupEnv_NODE_ENV(env)
    t.is(env.NODE_ENV, 'production')
})

test('setupEnv_NODE_ENV aws lambda log group name', t => {
    const env = Object.assign({ AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/demo-dev-hello' }, process.env)
    delete env.NODE_ENV
    setupEnv_NODE_ENV(env)
    t.is(env.NODE_ENV, 'development')
})

test('setupEnv_NODE_ENV aws lambda function name', t => {
    const env = Object.assign({ AWS_LAMBDA_FUNCTION_NAME: 'demo-dev-hello' }, process.env)
    delete env.NODE_ENV
    setupEnv_NODE_ENV(env)
    t.is(env.NODE_ENV, 'development')
})
