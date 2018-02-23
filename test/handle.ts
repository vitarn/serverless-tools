import test from 'ava'
import handle from '../handle'
import { Request } from '../handle/request'
import { Response } from '../handle/response'

test('Request aws GET /hello', t => {
    const event = {
        "path": "/hello",
        "httpMethod": "GET",
        "headers": {},
        "queryStringParameters": {
            "a": "1"
        },
    } as any
    const req = new Request(event, {} as any)

    t.is(req.path, '/hello')
    t.is(req.method, 'GET')
    t.deepEqual(req.query, { a: '1' })
})

test('Request aws POST /hello', t => {
    const event = {
        "path": "/hello",
        "httpMethod": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": "{\"a\":1}",
        "isBase64Encoded": false
    } as any
    const req = new Request(event, {} as any)

    t.is(req.path, '/hello')
    t.is(req.method, 'POST')
    t.deepEqual(req.body, '{"a":1}')
    t.deepEqual(req.json, { a: 1 })
})

test('Response aws default', t => {
    const res = new Response(() => { })
    res.end()

    t.is(res.status, 200)
    t.is(res.type, 'text/plain')
})

test('Response aws null', t => {
    const res = new Response(() => { })
    res.send(null)

    t.is(res.status, 204)
})

test('Response aws json', t => {
    const res = new Response(() => { })
    res.send({ a: 1 })

    t.is(res.type, 'application/json')
})

test('Response aws throw', t => {
    const res = new Response(() => { })
    res.throw(new Error('Oops!'))

    t.is(res.status, 500)
})

test('Response aws assert', t => {
    const res = new Response(() => { })
    res.assert(false)

    t.is(res.status, 400)
})

test('handle', t => {
    let err, obj
    const h = handle((req, res) => {
        res.end()
    })({}, {}, (e, o) => {
        err = e
        obj = o
    })

    t.falsy(err)
    t.is(obj.statusCode, 200)
})
