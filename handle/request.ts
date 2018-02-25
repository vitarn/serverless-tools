import { APIGatewayEvent as AwsEvent, Context as AwsContext } from 'aws-lambda'
import { APIGatewayEvent as AliEvent } from '../types/aliyun'

export type Event = AwsEvent & AliEvent
export type Context = AwsContext

export class Request {
    event: Event
    context: Context
    private _cache: any

    constructor(event: Event, context: Context) {
        if (typeof event === 'string' /* aliyun */) {
            this.event = JSON.parse(event)
        } else {
            this.event = event
        }

        this.context = context
        this._cache = {}
    }

    get path() {
        return this.event.path
    }

    get method() {
        return this.event.httpMethod
    }

    get headers() {
        return this.event.headers
    }

    get query() {
        return this.event.queryStringParameters
            || this.event.queryParameters /* aliyun */
    }

    get params() {
        return this.event.pathParameters
    }

    get body() {
        if (!('body' in this._cache)) {
            this._cache.body = this.event.body

            if (this.event.isBase64Encoded) {
                this._cache.body = new Buffer(this._cache.body, 'base64').toString()
            }
        }

        return this._cache.body
    }

    get json() {
        if (!('json' in this._cache)) {
            try {
                this._cache.json = JSON.parse(this.body)
            } catch (err) {
                // console.error(err)
                this._cache.json = null
            }
        }

        return this._cache.json
    }
}
