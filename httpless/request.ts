import { format } from 'url'

import { IncomingMessage, IncomingHttpHeaders } from 'http'
import {
    APIGatewayEvent, Context,
    AwsAPIGatewayEvent, QcloudAPIGatewayEvent, AliyunAPIGatewayEvent
} from '../types'

export class Request /* extends http.IncomingMessage */ {
    event: APIGatewayEvent
    context: Context
    env: NodeJS.ProcessEnv = process.env

    connection
    rawHeaders
    trailers
    rawTrailers
    setTimeout
    socket
    destroy
    readable

    protected _cache = {}

    constructor(event: APIGatewayEvent | string, context: Context) {
        if (typeof event === 'string' /* aliyun */) {
            this.event = JSON.parse(event)
        } else {
            this.event = event
        }

        this.context = context
    }

    get provider() {
        const { env } = this

        if ('AWS_LAMBDA_FUNCTION_NAME' in env) return 'aws'
        if (env.HOME === '/home/qcloud') return 'qcloud'
        if (env.FC_FUNC_CODE_PATH === '/code/') return 'aliyun'
        return 'unknown'
    }

    get nodeEnv() {
        const { env } = this

        if (env.NODE_ENV) return env.NODE_ENV

        const {
            AWS_LAMBDA_LOG_GROUP_NAME: logName = '',
            AWS_LAMBDA_FUNCTION_NAME: funcName = ''
        } = env
        const fixture = [logName, funcName].join('')

        if (~fixture.indexOf('-dev-')) return 'development'

        return 'production'
    }

    get httpVersion(): string {
        return '1.1'
        // return this._cache['httpVersion']
        //     || (this._cache['httpVersion'] =
        //         (<AwsAPIGatewayEvent>this.event).requestContext
        //         ? (<AwsAPIGatewayEvent>this.event).requestContext.protocol, 'requestContext.protocol') || '')
        //             .match(/[012]\.[019]/)[0]
        //         || '1.1'
        //     )
    }

    get httpVersionMajor() {
        return 1
        // return parseInt(this.httpVersion.split('.')[0])
    }

    get httpVersionMinor() {
        return 1
        // return parseInt(this.httpVersion.split('.')[1])
    }

    get headers(): IncomingHttpHeaders {
        return this._cache['headers']
            || (this._cache['headers'] =
                Object.keys(this.event.headers || {})
                    .reduce((acc, key) => Object.assign(acc, {
                        [key.toLowerCase()]: this.event.headers[key]
                    }), {})
            )
    }

    get method() {
        return this.event.httpMethod || 'GET'
    }

    get url(): string {
        return this._cache['url']
            || (this._cache['url'] =
                format({
                    pathname: this.event.path
                        || '/',
                    query: (<AwsAPIGatewayEvent>this.event).queryStringParameters
                        || (<QcloudAPIGatewayEvent>this.event).queryString
                        || (<AliyunAPIGatewayEvent>this.event).queryParameters
                        || null,
                })
            )
    }
}
