import assert from 'assert'
import http from 'http'
import { extname } from 'path'

import isJSON from 'koa-is-json'
import statuses from 'statuses'
import { contentType } from 'mime-types'

import { Request as HttplessRequest } from '../httpless/request'
import { Response as HttplessResponse } from '../httpless/response'
import { Application } from './application'
import { Context } from './context'
import { Request } from './request'

export class Response {
    app: Application
    ctx: Context
    request: Request
    req: HttplessRequest
    res: HttplessResponse

    /**
     * Return response header.
     */

    get header() {
        return this.res.getHeaders()
    }

    /**
     * Return response header, alias as response.header
     */

    get headers() {
        return this.header
    }

    _explicitStatus = false

    /**
     * Get response status code.
     */

    get status() {
        return this.res.statusCode
    }

    /**
     * Set response status code.
     */

    set status(code) {
        assert('number' == typeof code, 'status code must be a number')
        assert(statuses[code], `invalid status code: ${code}`)
        this._explicitStatus = true
        this.res.statusCode = code
        // if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses[code]
        if (this.body && statuses.empty[code]) this.body = null
    }

    /**
     * Get response status message
     */

    get message() {
        return this.res.statusMessage || statuses[this.status]
    }

    /**
     * Set response status message
     */

    set message(msg) {
        this.res.statusMessage = msg
    }


    _body

    /**
     * Get response body.
     */

    get body() {
        return this._body;
    }

    /**
     * Set response body.
     */

    set body(val: string | object | Buffer) {
        const original = this._body
        this._body = val

        // no content
        if (null == val) {
            if (!statuses.empty[this.status]) this.status = 204
            this.remove('Content-Type')
            this.remove('Content-Length')
            this.remove('Transfer-Encoding')
            return
        }

        // set the status
        if (!this._explicitStatus) this.status = 200

        // set the content-type only if not yet set
        const setType = !this.header['content-type']

        // string
        if ('string' == typeof val) {
            if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text'
            this.length = Buffer.byteLength(val)
            return
        }

        // buffer
        if (Buffer.isBuffer(val)) {
            if (setType) this.type = 'bin'
            this.length = val.length
            return
        }

        // // stream
        // if ('function' == typeof val.pipe) {
        //     onFinish(this.res, destroy.bind(null, val));
        //     ensureErrorHandler(val, err => this.ctx.onerror(err));

        //     // overwriting
        //     if (null != original && original != val) this.remove('Content-Length');

        //     if (setType) this.type = 'bin';
        //     return;
        // }

        // json
        this.remove('Content-Length')
        this.type = 'json'
    }

    /**
     * Return parsed response Content-Length when present.
     */

    get length() {
        const len = this.header['content-length']
        const body = this.body

        if (null == len) {
            if (!body) return
            if ('string' == typeof body) return Buffer.byteLength(body)
            if (Buffer.isBuffer(body)) return body.length
            if (isJSON(body)) return Buffer.byteLength(JSON.stringify(body))
            return
        }

        return ~~len
    }

    /**
     * Set Content-Length field to `n`.
     */

    set length(n) {
        this.set('Content-Length', n.toString())
    }

    /**
     * Vary on `field`.
     */

    vary(field: string) {
    }

    /**
     * Perform a 302 redirect to `url`.
     *
     * The string "back" is special-cased
     * to provide Referrer support, when Referrer
     * is not present `alt` or "/" is used.
     *
     * Examples:
     *
     *    this.redirect('back');
     *    this.redirect('back', '/index.html');
     *    this.redirect('/login');
     *    this.redirect('http://google.com');
     */

    redirect(url: string, alt?: string) {
        // location
        if ('back' == url) url = this.ctx.get('Referrer') as string || alt || '/'
        this.set('Location', url)

        // status
        if (!statuses.redirect[this.status]) this.status = 302

        // html
        if (this.ctx.accepts('html')) {
            url = escape(url)
            this.type = 'text/html; charset=utf-8'
            this.body = `Redirecting to <a href="${url}">${url}</a>.`
            return
        }

        // text
        this.type = 'text/plain; charset=utf-8'
        this.body = `Redirecting to ${url}.`
    }

    /**
     * Set Content-Disposition header to "attachment" with optional `filename`.
     */

    attachment(filename: string) {
        // if (filename) this.type = extname(filename)
        // this.set('Content-Disposition', contentDisposition(filename))
    }

    /**
     * Set Content-Type response header with `type` through `mime.lookup()`
     * when it does not contain a charset.
     *
     * Examples:
     *
     *     this.type = '.html';
     *     this.type = 'html';
     *     this.type = 'json';
     *     this.type = 'application/json';
     *     this.type = 'png';
     */

    set type(type: string) {
        type = contentType(type)
        if (type) {
            this.set('Content-Type', type)
        } else {
            this.remove('Content-Type')
        }
    }

    /**
     * Set the Last-Modified date using a string or a Date.
     *
     *     this.response.lastModified = new Date();
     *     this.response.lastModified = '2013-09-13';
     */

    set lastModified(val: string | Date) {
        if ('string' == typeof val) val = new Date(val)
        this.set('Last-Modified', val.toUTCString())
    }

    /**
     * Get the Last-Modified date in Date form, if it exists.
     */

    get lastModified() {
        const date = this.get('last-modified') as string
        if (date) return new Date(date)
    }

    /**
     * Set the ETag of a response.
     * This will normalize the quotes if necessary.
     *
     *     this.response.etag = 'md5hashsum';
     *     this.response.etag = '"md5hashsum"';
     *     this.response.etag = 'W/"123456789"';
     */

    set etag(val: string) {
        if (!/^(W\/)?"/.test(val)) val = `"${val}"`
        this.set('ETag', val)
    }

    /**
     * Get the ETag of a response.
     */

    get etag() {
        return this.get('ETag') as string
    }

    /**
     * Return the response mime type void of
     * parameters such as "charset".
     */

    get type() {
        const type = this.get('Content-Type') as string
        if (!type) return ''
        return type.split(';')[0]
    }

    /**
     * Check whether the response is one of the listed types.
     * Pretty much the same as `this.request.is()`.
     */

    // is(types) {
    //     const type = this.type
    //     if (!types) return type || false
    //     if (!Array.isArray(types)) types = [].slice.call(arguments)
    //     return typeis(type, types)
    // }

    /**
     * Return response header.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     */

    get(field: string) {
        return this.header[field.toLowerCase()] || ''
    }

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz']);
     *    this.set('Accept', 'application/json');
     *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     * @api public
     */

    set(field: string | object, val?: string | string[]) {
        if (2 == arguments.length) {
            if (Array.isArray(val)) val = val.map(String)
            else val = String(val)
            this.res.setHeader(field as string, val)
        } else {
            for (const key in field as object) {
                this.set(key, field[key])
            }
        }
    }

    /**
     * Append additional header `field` with value `val`.
     *
     * Examples:
     *
     * ```
     * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
     * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
     * this.append('Warning', '199 Miscellaneous warning');
     * ```
     */

    append(field: string, val: number | string | string[]) {
        // const prev = this.get(field)

        // if (prev) {
        //     val = Array.isArray(prev)
        //         ? prev.concat(val as any)
        //         : [prev].concat(val)
        // }

        // return this.set(field, val)
    }

    /**
     * Remove header `field`.
     */

    remove(field) {
        this.res.removeHeader(field)
    }

    /**
     * Checks if the request is writable.
     */

    get writable() {
        return true
    }

    /**
     * Inspect implementation.
     */

    inspect() {
        if (!this.res) return
        return Object.assign(this.toJSON(), { body: this.body })
    }

    /**
     * Return JSON representation.
     */

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            header: this.header,
        }
    }
}
