import sinon from 'sinon'
import { Request } from '../koaless/request'
import { Response } from '../koaless/response'
import Koaless from '../koaless'

describe('koaless', () => {
    describe('#handler()', () => {
        let app: Koaless
        let callback: sinon.SinonSpy

        beforeEach(() => {
            app = new Koaless()
            callback = sinon.spy()
        })

        test('it accept cloud function arguments', async () => {
            await app.handler()({} as any, {} as any, callback)

            expect(callback.args[0]).toEqual([
                null,
                {
                    statusCode: 404,
                    headers: { },
                    body: 'undefined'
                }
            ])
        })
    })

    describe('middleware', () => {
        let app: Koaless
        let callback: sinon.SinonSpy

        beforeEach(() => {
            app = new Koaless()
            callback = sinon.spy()
        })

        xtest('@koa/cors', async () => {
            app.use(require('@koa/cors')())
            await app.handler()(
                {
                    headers: {
                        'origin': 'https://example.com'
                    }
                } as any,
                {} as any,
                callback
            )

            console.log(callback.args)

            expect(callback.called).toBe(true)
        })
    })
})
