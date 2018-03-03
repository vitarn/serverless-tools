import http from 'http'
import { URL, format } from 'url'
import { Request as HttplessRequest } from '../httpless/request'

import { AwsAPIGatewayEvent, QcloudAPIGatewayEvent, AliyunAPIGatewayEvent } from '../types'

export class Request extends HttplessRequest {
    /**
     * Get origin of URL.
     */
    get origin() {
        return `${this.protocol}://${this.host}`
    }

    /**
     * Get full request URL.
     */
    get href() {
        // support: `GET http://example.com/foo`
        if (/^https?:\/\//i.test(this.url)) return this.url
        return this.origin + this.url
    }

    /**
     * Get request pathname.
     */
    get path() {
        return this.event.path
    }

    /**
     * Get parsed query-string.
     */
    get query() {
        return this._cache['query']
            || (this._cache['query'] =
                (<AwsAPIGatewayEvent>this.event).queryStringParameters
                || (<QcloudAPIGatewayEvent>this.event).queryString
                || (<AliyunAPIGatewayEvent>this.event).queryParameters
                || {}
            )
    }

    /**
     * Get query string.
     */
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
                this.memoizedURL = new URL(this.url)
            } catch (err) {
                this.memoizedURL = Object.create(null)
            }
        }
        return this.memoizedURL
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
        switch (field = field.toLowerCase()) {
            case 'referer':
            case 'referrer':
                return this.headers.referrer || this.headers.referer || ''
            default:
                return this.headers[field] || ''
        }
    }

    /**
     * Inspect implementation.
     */

    inspect() {
        return this.toJSON()
    }

    /**
     * Return JSON representation.
     */

    toJSON() {
        return {
            method: this.method,
            url: this.url,
            headers: this.headers,
        }
    }
}
