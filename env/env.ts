const { env } = process

/**
 * Setup PROVIDER
 */
export function setupEnv_PROVIDER() {
    if (env.AWS_REGION) {
        env.PROVIDER = 'aws'
    }
}

/**
 * Setup NODE_ENV
 */
export function setupEnv_NODE_ENV() {
    if (env.NODE_ENV) return

    const {
        AWS_LAMBDA_LOG_GROUP_NAME: logName = '',
        AWS_LAMBDA_FUNCTION_NAME: funcName = ''
    } = env
    const fixture = [logName, funcName].join('')
    
    if (fixture.includes('-dev-')) {
        env.NODE_ENV = 'development'
    } else {
        env.NODE_ENV = 'production'
    }
}
