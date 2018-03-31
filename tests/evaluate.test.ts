import { Evaluate } from '../evaluate'

describe('Evaluate', () => {
    it('get provider aws', () => {
        const report = new Evaluate({ AWS_LAMBDA_FUNCTION_NAME: 'hello' })

        expect(report.provider).toBe('aws')
    })

    it('get provider qcloud', () => {
        const report = new Evaluate({ HOME: '/home/qcloud' })

        expect(report.provider).toBe('qcloud')
    })

    it('get provider unknown', () => {
        const report = new Evaluate({})

        expect(report.provider).toBe('unknown')
    })

    it('get nodeEnv test', () => {
        const report = new Evaluate()

        expect(report.nodeEnv).toBe('test')
    })

    it('get nodeEnv default production', () => {
        const report = new Evaluate({})

        expect(report.nodeEnv).toBe('production')
    })

    it('get nodeEnv development by aws lambda log group name', () => {
        const report = new Evaluate({ AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/demo-dev-hello' })


        expect(report.nodeEnv).toBe('development')
    })

    it('get nodeEnv development by aws lambda function name', () => {
        const report = new Evaluate({ AWS_LAMBDA_FUNCTION_NAME: 'demo-dev-hello' })


        expect(report.nodeEnv).toBe('development')
    })
})
