import test from 'ava'
import { Probe } from '../probe/probe'

test('Probe get provider aws', t => {
    const probe = new Probe({ AWS_LAMBDA_FUNCTION_NAME: 'hello' })

    t.is(probe.provider, 'aws')
})

test('Probe get nodeEnv test', t => {
    const probe = new Probe()

    t.is(probe.nodeEnv, 'test')
})

test('Probe get nodeEnv default production', t => {
    const probe = new Probe({})

    t.is(probe.nodeEnv, 'production')
})

test('Probe get nodeEnv development by aws lambda log group name', t => {
    const probe = new Probe({ AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/demo-dev-hello' })
    
    
    t.is(probe.nodeEnv, 'development')
})

test('Probe get nodeEnv development by aws lambda function name', t => {

    const probe = new Probe({ AWS_LAMBDA_FUNCTION_NAME: 'demo-dev-hello' })


    t.is(probe.nodeEnv, 'development')
})
