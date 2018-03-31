import { probe } from '../probe'
import { handler } from '../probe'

describe('probe', () => {
    it('probe include os and process report', () => {
        let report = probe()

        expect(report.os).toBeTruthy()
        expect(report.process).toBeTruthy()
    })

    it('handler is a lambda handler', () => {
        let body
        let cb = (err, data) => body = data.body
        let res = handler({}, {}, cb)

        expect(typeof body).toBe('string')

        let json = JSON.parse(body)

        expect(json.title).toBeTruthy()
        expect(json.event).toBeTruthy()
        expect(json.context).toBeTruthy()
    })
})
