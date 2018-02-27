import test from 'ava'
import { Evaluate } from '../evaluate'

test('Evaluate get provider aws', t => {
    const report = new Evaluate({ AWS_LAMBDA_FUNCTION_NAME: 'hello' })

    t.is(report.provider, 'aws')
})

test('Evaluate get provider qcloud', t => {
    const report = new Evaluate({ HOME: '/home/qcloud' })

    t.is(report.provider, 'qcloud')
})

test('Evaluate get provider unknown', t => {
    const report = new Evaluate({})

    t.is(report.provider, 'unknown')
})

test('Evaluate get nodeEnv test', t => {
    const report = new Evaluate()

    t.is(report.nodeEnv, 'test')
})

test('Evaluate get nodeEnv default production', t => {
    const report = new Evaluate({})

    t.is(report.nodeEnv, 'production')
})

test('Evaluate get nodeEnv development by aws lambda log group name', t => {
    const report = new Evaluate({ AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/demo-dev-hello' })


    t.is(report.nodeEnv, 'development')
})

test('Evaluate get nodeEnv development by aws lambda function name', t => {

    const report = new Evaluate({ AWS_LAMBDA_FUNCTION_NAME: 'demo-dev-hello' })


    t.is(report.nodeEnv, 'development')
})
