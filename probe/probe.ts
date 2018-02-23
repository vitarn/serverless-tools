export interface Report {
    provider?: 'aws' | 'qcloud' | 'aliyun'
    nodeEnv: 'development' | 'production'
}

export class Probe {
    env: NodeJS.ProcessEnv

    constructor(env: NodeJS.ProcessEnv = process.env) {
        this.env = env
    }

    get provider() {
        if ('AWS_LAMBDA_FUNCTION_NAME' in this.env) return 'aws'
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
        } as Report
    }
}
