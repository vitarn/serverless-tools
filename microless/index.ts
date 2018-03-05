import contentType from 'content-type'
import createError from 'http-errors'

import { APIGatewayEvent, Context, Callback } from '../types'

import { debug } from './common'
import { Request } from './request'
import { Response } from './response'

const { NODE_ENV } = process.env
const DEV = NODE_ENV === 'development'

export { default as createError } from 'http-errors'

export const send = (res: Response, code: number, obj = null) => {
    debug('send %d %o', code, obj)
    res.statusCode = code

    if (obj === null) {
        res.end()
        return
    }

    if (Buffer.isBuffer(obj)) {
        if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/octet-stream')
        }

        res.setHeader('Content-Length', obj.length)
        res.end(obj)
        return
    }

    let str = obj

    if (typeof obj === 'object' || typeof obj === 'number') {
        // We stringify before setting the header
        // in case `JSON.stringify` throws and a
        // 500 has to be sent instead

        // the `JSON.stringify` call is split into
        // two cases as `JSON.stringify` is optimized
        // in V8 if called with only one argument
        // if (DEV) {
        //     str = JSON.stringify(obj, null, 2)
        // } else {
        //     str = JSON.stringify(obj)
        // }

        if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
        }
    }

    // const len = typeof str === 'string' || Buffer.isBuffer(str)
    //     ? Buffer.byteLength(str)
    //     : 0
    // res.setHeader('Content-Length', 0)

    res.end(str)
}

export const sendError = (req: Request, res: Response, err: createError.HttpError) => {
    const statusCode = err.statusCode || err.status
    const message = statusCode && err.expose ? err.message : 'Internal Server Error'

    for (let header in err.headers || []) {
        res.setHeader(header, err.headers[header])
    }

    send(res, statusCode || 500, DEV ? err.stack : message)

    if (!DEV) return

    if (err instanceof Error) {
        console.error(err.stack)
    } else {
        console.warn('thrown error must be an instance Error')
    }
}

const parseJSON = str => {
    try {
        return JSON.parse(str)
    } catch (err) {
        throw createError(400, 'Invalid JSON', err)
    }
}

export interface MicrolessParseOptions {
    limit?: string
    encoding?: string
}

export const buffer = async (req: Request) => new Buffer(
    req.event.body,
    req.event.isBase64Encoded ? 'base64' : 'utf8'
)

export const text = async (req: Request) => req.event.isBase64Encoded
    ? buffer(req).then(b => b.toString())
    : req.event.body

export const json = async (req: Request) => text(req).then(t => parseJSON(t))

export const run = async (req: Request, res: Response, fn: (req?: Request, res?: Response) => any) => {
    try {
        debug('run handler...')
        const val = await fn(req, res)
        debug('run handler return %o', val)

        if (val === null) {
            send(res, 204, null)
            return
        }

        // Send value if it is not undefined, otherwise assume res.end
        // will be called later
        if (undefined !== val) {
            send(res, res.statusCode || 200, val)
        }
    } catch (err) {
        debug('run handler throw %o', err)
        sendError(req, res, err)
    }
}

const handler = (fn: (req?: Request, res?: Response) => any) => {
    return function (event: APIGatewayEvent, context: Context, callback: Callback) {
        const request = new Request(event, context)
        const response = new Response(callback, request)
        run(request, response, fn)
    }
}

export type Handler = typeof handler
export type Enhancer<Q extends Request, S extends Response> = (fn: (req: Request, res: Response) => any) => (req: Q, res: S) => any

export default handler

export * from './compose'
export * from './request'
export * from './response'
