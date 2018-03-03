import test from 'ava'
import * as common from '../httpless/common'
import { Request } from '../httpless/request'
import { Response } from '../httpless/response'
import httpless from '../httpless'

test('common has debug function', t => {
    t.is(typeof common.debug, 'function')
})

test('Request GET /hello', t => {
    const event = {
        "path": "/hello",
        "httpMethod": "GET",
        "headers": {},
        "queryStringParameters": {
            "a": "1"
        },
    } as any
    const req = new Request(event, {} as any)

    t.is(req.method, 'GET')
    t.is(req.url, 'http:/hello?a=1')
})

test('Request aws GET /hello', t => {
    const event = {
        "path": "/hello",
        "httpMethod": "GET",
        "headers": {
            "Host": "xxx.execute-api.cn-north-1.amazonaws.com.cn",
            "Content-Type": "application/json",
            "X-Forwarded-Proto": "https",
        },
        "queryStringParameters": {
            "a": "1",
        },
    } as any
    const req = new Request(event, {} as any)

    t.is(req.method, 'GET')
    t.is(req.url, 'https://xxx.execute-api.cn-north-1.amazonaws.com.cn/hello?a=1')
    t.is(req.headers['content-type'], 'application/json')
})

test('Request qcloud GET /hello', t => {
    const event = JSON.stringify({
        "path": "/hello",
        "httpMethod": "GET",
        "headers": {
            "host": "service-id-appid.ap-beijing.apigateway.myqcloud.com"
        },
        "queryParameters": {
            "a": "1"
        },
    }) as any
    const req = new Request(event, {} as any)

    t.is(req.method, 'GET')
    t.is(req.url, 'http://service-id-appid.ap-beijing.apigateway.myqcloud.com/hello?a=1')
})

test('Request aliyun GET /hello', t => {
    const event = JSON.stringify({
        "path": "/hello",
        "httpMethod": "GET",
        "headers": { },
        "queryParameters": {
            "a": "1"
        },
    }) as any
    const req = new Request(event, {} as any)

    t.is(req.method, 'GET')
    t.is(req.url, 'http:/hello?a=1')
})

test('Response aws default', t => {
    const res = new Response(() => { })
    res.end()

    t.is(res.statusCode, 200)
    t.is(res.getHeader('content-type'), 'text/plain')
})

test('Response aws null', t => {
    const res = new Response(() => { })
    res.write(null)

    t.is(res.statusCode, 204)
})

test('Response aws string', t => {
    const res = new Response(() => { })
    res.write('hello')

    t.is(res.statusCode, 200)
    t.is(res.getHeader('content-type'), 'text/plain')
})

test('Response aws json', t => {
    const res = new Response(() => { })
    res.write({ a: 1 })

    t.is(res.statusCode, 200)
    t.is(res.getHeader('content-type'), 'application/json')
})

test('httpless', t => {
    let err, obj
    const h = httpless((req, res) => {
        res.end()
    })({}, {}, (e, o) => {
        err = e
        obj = o
    })

    t.falsy(err)
    t.is(obj.statusCode, 200)
})
