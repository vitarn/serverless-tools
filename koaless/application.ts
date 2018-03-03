import assert from 'assert'

import _get from 'lodash.get'
import compose from 'koa-compose'
import accepts from 'accepts'
import statuses from 'statuses'

import { debug } from './common'
import { Context } from './context'
import { Request } from './request'
import { Response } from './response'

import httpless from '../httpless'
import { Request as HttplessRequest } from '../httpless/request'
import { Response as HttplessResponse } from '../httpless/response'

import { Event, Context as _Context, Callback } from '../types'

export class Application {
    proxy = true
    middleware = []
    subdomainOffset = 2
    env = process.env.NODE_ENV || 'development'
    silent: boolean = false

    context: Context
    request: Request
    response: Response

    constructor() {
    }

    toJSON() {
        return {
            subdomainOffset: this.subdomainOffset,
            proxy: this.proxy,
            env: this.env,
        }
    }

    inspect() {
        return this.toJSON()
    }

    use(fn) {
        debug('application#use(fn: %o)', fn)
        if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
        this.middleware.push(fn)
        return this
    }

    handler(handler?: (ctx: Context, next?: () => Promise<any>) => any) {
        debug('application#handler()')
        const fn = compose(
            handler ? this.middleware.concat(handler) : this.middleware
        )

        const handleRequest = (req, res) => {
            const ctx = this.createContext(req, res)
            return this.handleRequest(ctx, fn)
        }

        return httpless(handleRequest)
    }

    handleRequest(ctx: Context, fnMiddleware) {
        debug('application#handleRequest')
        const res = ctx.res
        res.statusCode = 404
        const onerror = err => this.onerror(err)
        const handleResponse = () => respond(ctx)
        return fnMiddleware(ctx).then(handleResponse).catch(onerror)
    }

    createContext(req: HttplessRequest, res: HttplessResponse) {
        debug('application#createContext')
        const context = new Context()
        const request = context.request = new Request()
        const response = context.response = new Response()
        context.app = request.app = response.app = this
        context.req = request.req = response.req = req
        context.res = request.res = response.res = res
        request.ctx = response.ctx = context
        request.response = response
        response.request = request
        context.originalUrl = request.originalUrl = req.url
        // context.cookies = new Cookies(req, res, {
        //     keys: this.keys,
        //     secure: request.secure
        // });
        request.ip = request.ips[0]
            || req.headers['x-forwarded-proto']
            || _get(req.event, 'requestContext.sourceIp')
            || ''
        context.accept = request.accept = accepts(req)
        return context
    }

    onerror(err) {
        assert(err instanceof Error, `non-error thrown: ${err}`)
        debug('application#onerror(err: %o)', err)

        if (404 == err.status || err.expose) return;
        if (this.silent) return;

        const msg = err.stack || err.toString();
        console.error();
        console.error(msg.replace(/^/gm, '  '));
        console.error();
    }
}

/**
 * Response helper.
 */

function respond(ctx: Context) {
    debug('application function respond')
    // allow bypassing koa
    if (false === ctx.respond) return
    
    const res = ctx.res
    if (!ctx.writable) return
    let body = ctx.body
    const code = ctx.status
    
    // ignore body
    if (statuses.empty[code]) {
        // strip headers
        ctx.body = null
        return res.end()
    }
    
    if ('HEAD' == ctx.method) {
        ctx.length = Buffer.byteLength(JSON.stringify(body))
        return res.end()
    }
    
    // status body
    if (null == body) {
        body = ctx.message || String(code)
        ctx.type = 'text'
        ctx.length = Buffer.byteLength(body)
        return res.end(body)
    }

    res.end(body)
}
