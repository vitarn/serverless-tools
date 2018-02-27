import test from 'ava'
import { probe } from '../probe'
import { handler } from '../probe'

test('probe include os and process report', t => {
    let report = probe()

    t.truthy(report.os)
    t.truthy(report.process)
})

test('handler is a lambda handler', t => {
    let body
    let cb = (err, data) => body = data.body
    let res = handler({}, {}, cb)

    t.is(typeof body, 'string')

    let json = JSON.parse(body)

    t.truthy(json.title)
    t.truthy(json.event)
    t.truthy(json.context)
})
