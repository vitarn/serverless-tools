import { OutgoingHttpHeaders } from 'http'
import { debug } from './common'
import { Request } from './request'

export class Response /* extends http.ServerResponse */ {
    protected callback: Function
    protected req: Request

    statusCode: number = 200
    statusMessage: string
    private headers: OutgoingHttpHeaders = {}
    private body: any

    constructor(callback, req?: Request) {
        this.callback = callback
        this.req = req
    }

    setHeader(name: string, value: number | string | string[]) {
        this.headers[name.toLowerCase()] = value
    }

    getHeader(name: string) {
        return this.headers[name.toLowerCase()]
    }

    getHeaders() {
        return this.headers
    }

    getHeaderNames() {
        return Object.keys(this.headers)
    }

    hasHeader(name: string) {
        return name.toLowerCase() in this.headers
    }

    removeHeader(name: string) {
        delete this.headers[name.toLowerCase()]
    }

    write(chunk: any): boolean {
        debug('response#write(chunk: %o)', chunk)

        this.body = chunk || ''

        return false
    }

    end(chunk?: any) {
        debug('response#end(chunk: %o)', chunk)
        if (typeof chunk !== 'undefined') {
            this.write(chunk)
        }

        /**
         * Not Recommended!
         * Pass error to callback will catch by API Gateway.
         * This error only write to log.
         * API Consumer will got `502 {"message": "Internal server error"}`.
         */
        if (this.body instanceof Error) {
            this.callback(this.body)
            return
        }

        const response = {
            headers: this.headers,
            body: this.body || ''
        }

        if (this.statusCode) {
            Object.assign(response, {
                statusCode: this.statusCode,
            })
        }

        if (Buffer.isBuffer(response.body)) {
            Object.assign(response, {
                body: response.body.toString('base64'),
                isBase64Encoded: true,
            })
        }

        debug('response#end response: %o', response)
        this.callback(null, response)
    }
}
