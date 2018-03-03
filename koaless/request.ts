import http from 'http'
import net from 'net'
import { URL, format } from 'url'

import typeis from 'type-is'

import { Request as HttplessRequest } from '../httpless/request'
import { Response as HttplessResponse } from '../httpless/response'
import { Application } from './application'
import { Context } from './context'
import { Response } from './response'

export class Request {
    app: Application
    ctx: Context
    response: Response
    req: HttplessRequest
    res: HttplessResponse

    originalUrl
    ip
    accept

    get header() {
        return this.req.headers
    }

    // set header(val) {
    //     this.req.headers = val
    // }

    get headers() {
        return this.header
    }

    // set headers(val) {
    //     this.header = val
    // }

    get url() {
        return this.req.url
    }

    // set url(val) {
    //     this.req.url = val
    // }

    get origin() {
        return `${this.protocol}://${this.host}`
    }

    get href() {
        // support: `GET http://example.com/foo`
        if (/^https?:\/\//i.test(this.originalUrl)) return this.originalUrl
        return this.origin + this.originalUrl
    }

    get method() {
        return this.req.method
    }

    // set method(val) {
    //     this.req.method = val
    // }

    get path() {
        return this.req.event.path
    }

    get query() {
        return this.req.event.queryStringParameters
            || this.req.event.queryString /* qcloud */
            || this.req.event.queryParameters /* aliyun */
            || {}
    }

    get querystring() {
        return this.search.slice(1)
    }

    /**
     * Get the search string. Same as the querystring
     * except it includes the leading ?.
     */

    get search() {
        return format({ query: this.query })
    }

    /**
     * Parse the "Host" header field host
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     */

    get host() {
        return (this.get('x-forwarded-host') || this.get('host') || '') as string
    }

    /**
     * Parse the "Host" header field hostname
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     */

    get hostname() {
        if ('[' == this.host[0]) return this.URL.hostname || '' // IPv6
        return this.host.split(':')[0]
    }

    private memoizedURL: URL

    /**
     * Get WHATWG parsed URL.
     * Lazily memoized.
     */

    get URL() {
        if (!this.memoizedURL) {
            try {
                this.memoizedURL = new URL(`${this.protocol}://${this.host}${this.originalUrl || ''}`)
            } catch (err) {
                this.memoizedURL = Object.create(null)
            }
        }
        return this.memoizedURL
    }

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     */

    get fresh() {
        // const method = this.method
        // const s = this.ctx.status

        // // GET or HEAD for weak freshness validation only
        // if ('GET' != method && 'HEAD' != method) return false

        // // 2xx or 304 as per rfc2616 14.26
        // if ((s >= 200 && s < 300) || 304 == s) {
        //     return fresh(this.header, this.ctx.response.header)
        // }

        // return false
        return true
    }

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     */

    get stale() {
        return !this.fresh
    }

    /**
     * Check if the request is idempotent.
     */

    get idempotent() {
        return !!~['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].indexOf(this.method)
    }

    /**
     * Return parsed Content-Length when present.
     */
    get length() {
        const len = this.get('Content-Length')
        if (len == '') return
        return ~~len
    }

    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the proxy setting
     * is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     */
    get protocol() {
        const proto = this.get('X-Forwarded-Proto') as string || 'http'
        return proto.split(/\s*,\s*/)[0]
    }

    /**
     * Short-hand for:
     *
     *    this.protocol == 'https'
     */

    get secure() {
        return 'https' == this.protocol
    }

    /**
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value were "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     */

    get ips() {
        return (this.get('X-Forwarded-For') as string).split(/\s*,\s*/)
            || []
    }

    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain
     * of the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting `app.subdomainOffset`.
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If `app.subdomainOffset` is not set, this.subdomains is
     * `["ferrets", "tobi"]`.
     * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
     */

    get subdomains() {
        const offset = this.app.subdomainOffset
        const hostname = this.hostname
        if (net.isIP(hostname)) return []
        return hostname
            .split('.')
            .reverse()
            .slice(offset)
    }

    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `false`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json" or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     this.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('html');
     *     // => "html"
     *     this.accepts('text/html');
     *     // => "text/html"
     *     this.accepts('json', 'text');
     *     // => "json"
     *     this.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('image/png');
     *     this.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts(['html', 'json']);
     *     this.accepts('html', 'json');
     *     // => "json"
     */

    accepts(...args) {
        return this.accept.types(...args)
    }

    /**
     * Return accepted encodings or best fit based on `encodings`.
     *
     * Given `Accept-Encoding: gzip, deflate`
     * an array sorted by quality is returned:
     *
     *     ['gzip', 'deflate']
     */

    acceptsEncodings(...args) {
        return this.accept.encodings(...args)
    }

    /**
     * Return accepted charsets or best fit based on `charsets`.
     *
     * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
     * an array sorted by quality is returned:
     *
     *     ['utf-8', 'utf-7', 'iso-8859-1']
     */

    acceptsCharsets(...args) {
        return this.accept.charsets(...args)
    }

    /**
     * Return accepted languages or best fit based on `langs`.
     *
     * Given `Accept-Language: en;q=0.8, es, pt`
     * an array sorted by quality is returned:
     *
     *     ['es', 'pt', 'en']
     */

    acceptsLanguages(...args) {
        return this.accept.languages(...args)
    }

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field, and it contains any of the give mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * Examples:
     *
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is('html'); // => 'html'
     *     this.is('text/html'); // => 'text/html'
     *     this.is('text/*', 'application/json'); // => 'text/html'
     *
     *     // When Content-Type is application/json
     *     this.is('json', 'urlencoded'); // => 'json'
     *     this.is('application/json'); // => 'application/json'
     *     this.is('html', 'application/*'); // => 'application/json'
     *
     *     this.is('html'); // => false
     */

    is(types) {
        if (!types) return typeis(this.req)
        if (!Array.isArray(types)) types = [].slice.call(arguments)
        return typeis(this.req, types)
    }

    /**
     * Return the request mime type void of
     * parameters such as "charset".
     */

    get type() {
        const type = this.get('Content-Type') as string
        if (!type) return ''
        return type.split(';')[0]
    }

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     *     this.get('Something');
     *     // => undefined
     */

    get(field: string) {
        const req = this.req
        switch (field = field.toLowerCase()) {
            case 'referer':
            case 'referrer':
                return req.headers.referrer || req.headers.referer || ''
            default:
                return req.headers[field] || ''
        }
    }

    /**
     * Inspect implementation.
     */

    inspect() {
        if (!this.req) return
        return this.toJSON()
    }

    /**
     * Return JSON representation.
     */

    toJSON() {
        return {
            method: this.method,
            url: this.url,
            header: this.header,
        }
    }
}
