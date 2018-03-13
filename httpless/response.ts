import { OutgoingHttpHeaders } from 'http'
import { debug } from './common'
import { Request } from './request'

export class Response /* extends http.ServerResponse */ {
    statusCode: number = 200
    statusMessage: string
    sendDate = true
    finished = false

    protected callback: Function
    protected req: Request
    protected headers: OutgoingHttpHeaders = {}
    protected body: any

    constructor(callback, req?: Request) {
        this.callback = callback
        this.req = req
    }

    setHeader(name: string, value: number | string | string[]) {
        if (this._headersSent) {
            const err = new Error('Cannot set headers after they are sent to the client')
            err.name = 'Error [ERR_HTTP_HEADERS_SENT]'
            throw err
        }

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

    private _headersSent = false

    get headersSent() {
        return this._headersSent
    }

    writeHead(statusCode: number, statusMessage?: string | OutgoingHttpHeaders, headers?: OutgoingHttpHeaders) {
        this.statusCode = statusCode

        if (typeof statusMessage === 'string') {
            this.statusMessage = statusMessage
        } else if (typeof statusMessage === 'object') {
            headers = statusMessage
        }

        for (let header in headers || []) {
            this.setHeader(header, headers[header])
        }

        this._headersSent = true
    }

    write(chunk: any): boolean {
        debug('response#write(chunk: %o)', chunk)

        if (this.finished) throw new Error('write after end')

        this.body = chunk || ''

        return false
    }

    end(chunk?: any) {
        debug('response#end(chunk: %o)', chunk)

        if (this.finished) return false

        if (undefined !== chunk) {
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

        if (
            this.req &&
            ~['aws'].indexOf(this.req.provider) &&
            response.body &&
            typeof response.body !== 'string'
        ) {
            response.body = JSON.stringify(response.body)
        }

        debug('response#end response: %o', response)
        this.callback(null, response)

        this.finished = true

        return false
    }
}
