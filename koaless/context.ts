import http from 'http'
import url from 'url'

import { Request as HttplessRequest } from '../httpless/request'
import { Response as HttplessResponse } from '../httpless/response'

import { Application } from './application'
import { Request } from './request'
import { Response } from './response'

export class Context {
    app: Application
    request: Request
    response: Response
    req: HttplessRequest
    res: HttplessResponse

    originalUrl
    accept

    state = {}

    respond = true
    writable = true

    body
    status

    length

    message

    type

    inspect() {
        return this.toJSON()
    }

    toJSON() {
        return {
            request: this.request.toJSON(),
            response: this.response.toJSON(),
            app: this.app.toJSON(),
            originalUrl: this.originalUrl,
            req: '<original node req>',
            res: '<original node res>',
            socket: '<original node socket>',
        }
    }

    /* Request delegation. */

    accepts(...args) {
        return this.request.accept(...args)
    }
    acceptsCharsets(...args) {
        return this.request.acceptsCharsets(...args)
    }
    acceptsEncodings(...args) {
        return this.request.acceptsEncodings(...args)
    }
    acceptsLanguages(...args) {
        return this.request.acceptsLanguages(...args)
    }
    get(field: string) {
        return this.request.get(field)
    }
    is(types) {
        return this.request.is(types)
    }
    get querystring() {
        return this.request.querystring
    }
    get idempotent() {
        return this.request.idempotent
    }
    get search() {
        return this.request.search
    }
    get method() {
        return this.request.method
    }
    get query() {
        return this.request.query
    }
    get path() {
        return this.request.path
    }
    get url() {
        return this.request.url
    }
    get origin() {
        return this.request.origin
    }
    get href() {
        return this.request.href
    }
    get subdomains() {
        return this.request.subdomains
    }
    get protocol() {
        return this.request.protocol
    }
    get host() {
        return this.request.host
    }
    get hostname() {
        return this.request.hostname
    }
    get URL() {
        return this.request.URL
    }
    get header() {
        return this.request.header
    }
    get headers() {
        return this.request.headers
    }
    get secure() {
        return this.request.secure
    }
    get stale() {
        return this.request.stale
    }
    get fresh() {
        return this.request.fresh
    }
    get ips() {
        return this.request.ips
    }
    get ip() {
        return this.request.ip
    }

    /* Response delegation. */

    vary(field: string) {
        this.response.vary(field)
    }

    set(field: string | object, val?: string | string[]) {
        this.response.set(field, val)
    }
}
