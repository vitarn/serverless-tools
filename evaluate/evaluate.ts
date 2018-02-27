export interface IReport {
    provider: 'aws' | 'qcloud' | 'aliyun' | 'unknown'
    nodeEnv: 'development' | 'production'
}

export class Evaluate {
    env: NodeJS.ProcessEnv

    constructor(env: NodeJS.ProcessEnv = process.env) {
        this.env = env
    }

    get provider() {
        if ('AWS_LAMBDA_FUNCTION_NAME' in this.env) return 'aws'
        if (this.env.HOME === '/home/qcloud') return 'qcloud'
        return 'unknown'
    }

    get nodeEnv() {
        if (this.env.NODE_ENV) return this.env.NODE_ENV

        const {
            AWS_LAMBDA_LOG_GROUP_NAME: logName = '',
            AWS_LAMBDA_FUNCTION_NAME: funcName = ''
        } = this.env
        const fixture = [logName, funcName].join('')

        if (fixture.includes('-dev-')) return 'development'

        return 'production'
    }

    /**
     * Grep report from current environment.
     */
    scan() {
        return {
            provider: this.provider,
            nodeEnv: this.nodeEnv,
        } as IReport
    }
}

export function evaluate(env: NodeJS.ProcessEnv = process.env) {
    return new Evaluate(env).scan()
}
