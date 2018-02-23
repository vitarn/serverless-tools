import test from 'ava'
import {
    setupEnv_PROVIDER, setupEnv_NODE_ENV,
} from '../env/env'

const { env } = process

test('setupEnv_PROVIDER aws', t => {
    t.falsy(env.PROVIDER)

    env.AWS_REGION = 'cn-north-1'
    setupEnv_PROVIDER()
    t.is(env.PROVIDER, 'aws')
})

test('setupEnv_NODE_ENV test', t => {
    try {
        setupEnv_NODE_ENV()
        t.is(env.NODE_ENV, 'test')
    } catch (err) {
        throw err
    } finally {
        env.NODE_ENV = 'test'
    }
})

test('setupEnv_NODE_ENV default production', t => {
    try {
        delete env.NODE_ENV
        setupEnv_NODE_ENV()
        t.is(env.NODE_ENV, 'production')
    } catch (err) {
        throw err
    } finally {
        env.NODE_ENV = 'test'
    }
})

test('setupEnv_NODE_ENV aws lambda log group name', t => {
    try {
        delete env.NODE_ENV
        env.AWS_LAMBDA_LOG_GROUP_NAME = '/aws/lambda/demo-dev-hello'
        setupEnv_NODE_ENV()
        t.is(env.NODE_ENV, 'development')
    } catch (err) {
        throw err
    } finally {
        delete env.AWS_LAMBDA_LOG_GROUP_NAME
        env.NODE_ENV = 'test'
    }
})

test('setupEnv_NODE_ENV aws lambda function name', t => {
    try {
        delete env.NODE_ENV
        env.AWS_LAMBDA_FUNCTION_NAME = 'demo-dev-hello'
        setupEnv_NODE_ENV()
        t.is(env.NODE_ENV, 'development')
    } catch (err) {
        throw err
    } finally {
        delete env.AWS_LAMBDA_FUNCTION_NAME
        env.NODE_ENV = 'test'
    }
})
 