import test from 'ava'
import { probe } from '../probe'
import { handler } from '../probe'

test('probe include os and process report', t => {
    const report = probe()

    t.truthy(report.os)
    t.truthy(report.process)
})

test('handler is a lambda handler', t => {
    let body
    const cb = (err, data) => body = data.body
    const res = handler({}, {}, cb)

    t.is(typeof body, 'string')
})
