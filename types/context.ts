import { Context as AwsContext } from 'aws-lambda'

export interface QcloudContext
    extends Pick<AwsContext, 'callbackWaitsForEmptyEventLoop'> {
    memory_limit_in_mb: number
    time_limit_in_ms: number
    request_id: string
}

export interface AliyunContext {
    region: string
    accountId: string
    requestId: string
    service: {
        name: string
        logStore: string
        logProject: string
    }
    credentials: {
        securityToken: string
        accessKeyId: string
        accessKeySecret: string
    }
    function: {
        name: string
        timeout: number
        memory: number
        handler: string
    }
}

export type Context = AwsContext | QcloudContext | AliyunContext
