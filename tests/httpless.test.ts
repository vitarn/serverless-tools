import sinon from 'sinon'
import httpless, { Request, Response } from '../httpless'

describe('httpless', () => {
    describe('Request', () => {
        describe('provider', () => {
            let req: Request

            beforeEach(() => req = new Request({} as any, {} as any))

            it('default unknown', () => {
                expect(req.provider).toBe('unknown')
            })

            it('understand aws', () => {
                req.env = { AWS_LAMBDA_FUNCTION_NAME: 'f' }
                expect(req.provider).toBe('aws')
            })

            it('understand qcloud', () => {
                req.env = { HOME: '/home/qcloud' }
                expect(req.provider).toBe('qcloud')
            })

            it('understand aliyun', () => {
                req.env = { FC_FUNC_CODE_PATH: '/code/' }
                expect(req.provider).toBe('aliyun')
            })
        })

        describe('nodeEnv', () => {
            let req: Request

            beforeEach(() => req = new Request({} as any, {} as any))

            it('default production', () => {
                req.env = {}
                expect(req.nodeEnv).toBe('production')
            })

            it('return NODE_ENV if exist', () => {
                req.env = { NODE_ENV: 'default' }
                expect(req.nodeEnv).toBe('default')
            })

            it('understand aws log name', () => {
                req.env = { AWS_LAMBDA_LOG_GROUP_NAME: 'demo-dev-test-logs' }
                expect(req.nodeEnv).toBe('development')
            })

            it('understand aws func name', () => {
                req.env = { AWS_LAMBDA_FUNCTION_NAME: 'demo-dev-test' }
                expect(req.nodeEnv).toBe('development')
            })
        })

        describe('headers', () => {
            it('transform lower case key', () => {
                let req = new Request({ headers: { 'Content-Type': 'text' } } as any, {} as any)
                expect(req.headers).toEqual({ 'content-type': 'text' })
            })
        })

        describe('method', () => {
            it('default GET', () => {
                let req = new Request({} as any, {} as any)
                expect(req.method).toBe('GET')
            })

            it('get from event', () => {
                let req = new Request({ httpMethod: 'POST' } as any, {} as any)
                expect(req.method).toBe('POST')
            })
        })

        describe('url', () => {
            it('default /', () => {
                let req = new Request({} as any, {} as any)
                expect(req.url).toBe('/')
            })

            it('get from event path', () => {
                let req = new Request({ path: '/foo' } as any, {} as any)
                expect(req.url).toBe('/foo')
            })

            it('get from event path and aws queryStringParameters', () => {
                let req = new Request({ path: '/foo', queryStringParameters: { a: 1 } } as any, {} as any)
                expect(req.url).toBe('/foo?a=1')
            })

            it('get from event aws queryStringParameters', () => {
                let req = new Request({ queryStringParameters: { a: 1 } } as any, {} as any)
                expect(req.url).toBe('/?a=1')
            })

            it('get from event path and qcloud queryString', () => {
                let req = new Request({ path: '/foo', queryString: { a: 1 } } as any, {} as any)
                expect(req.url).toBe('/foo?a=1')
            })

            it('get from event path and aliyun queryParameters', () => {
                let req = new Request({ path: '/foo', queryParameters: { a: 1 } } as any, {} as any)
                expect(req.url).toBe('/foo?a=1')
            })
        })
    })

    describe('Response', () => {
        let spy: sinon.SinonSpy
        let req: Request
        let res: Response

        beforeEach(() => {
            spy = sinon.spy()
            req = new Request({} as any, {} as any)
            res = new Response(spy, req)
        })

        describe('setHeader', () => {
            it('not throw', () => {
                expect(() => res.setHeader('Content-Type', 'text/plain')).not.toThrow()
            })
        })

        describe('getHeader', () => {
            it('take back header', () => {
                res.setHeader('Content-Type', 'text/plain')
                expect(res.getHeader('Content-Type')).toBe('text/plain')
            })
        })

        describe('getHeaders', () => {
            it('take back all headers', () => {
                res.setHeader('Content-Type', 'text/plain')
                expect(res.getHeaders()).toEqual({
                    'content-type': 'text/plain'
                })
            })
        })

        describe('getHeaderNames', () => {
            it('take back header names in lower case', () => {
                res.setHeader('content-type', 'text/plain')
                expect(res.getHeaderNames()).toEqual(['content-type'])
            })
        })

        describe('hasHeader', () => {
            it('check if has header', () => {
                res.setHeader('Content-Type', 'text/plain')
                expect(res.hasHeader('Content-Type')).toBe(true)
            })

            it('check if has header case insensitive', () => {
                res.setHeader('Content-Type', 'text/plain')
                expect(res.hasHeader('content-type')).toBe(true)
            })
        })

        describe('writeHead', () => {
            it('set headersSent to true', () => {
                res.writeHead(200)
                expect(res.headersSent).toBe(true)
            })

            it('cannot set header after writeHead', () => {
                res.writeHead(200)
                expect(() => res.setHeader('a', 1)).toThrow('Cannot set headers after they are sent to the client')
            })
        })

        describe('write', () => {
            it('always return false', () => {
                expect(res.write('')).toBe(false)
            })

            it('wont throw', () => {
                for (let v of [
                    null, undefined,
                    {},
                    true, 1,
                    new Error, new Buffer(''),
                ]) {
                    expect(() => res.write(v)).not.toThrow()
                }
            })
        })

        describe('end', () => {
            it('always return false', () => {
                expect(res.end()).toBe(false)
            })

            it('wont throw', () => {
                for (let v of [
                    null, undefined,
                    {},
                    true, 1,
                    new Error, new Buffer(''),
                ]) {
                    expect(() => new Response(() => {}).end(v)).not.toThrow()
                }
            })

            it('set finished to true', () => {
                expect(res.finished).toBe(false)
                res.end()
                expect(res.finished).toBe(true)
                expect(() => res.write('')).toThrow('write after end')
            })

            it('throw error to api gateway', () => {
                let err = new Error('take this')
                res.end(err)

                expect(spy.calledWithExactly(err)).toBe(true)
            })

            it('callback default', () => {
                res.end()

                expect(spy.calledWithExactly(null, {
                    statusCode: 200,
                    headers: {},
                    body: '',
                })).toBe(true)
            })

            it('callback statusCode', () => {
                res.statusCode = 201
                res.end()

                expect(spy.calledWithExactly(null, {
                    statusCode: 201,
                    headers: {},
                    body: '',
                })).toBe(true)
            })

            it('callback headers', () => {
                res.setHeader('Content-Type', 'text/plain')
                res.end()

                expect(spy.calledWithExactly(null, {
                    statusCode: 200,
                    headers: {
                        'content-type': 'text/plain',
                    },
                    body: '',
                })).toBe(true)
            })

            it('callback string body', () => {
                res.end('ok')

                expect(spy.calledWithExactly(null, {
                    statusCode: 200,
                    headers: {
                    },
                    body: 'ok',
                })).toBe(true)
            })

            it('callback object body', () => {
                res.end({ a: 1 })

                expect(spy.calledWithExactly(null, {
                    statusCode: 200,
                    headers: {
                    },
                    body: { a: 1 },
                })).toBe(true)
            })

            it('callback buffer body', () => {
                res.end(new Buffer('1'))

                expect(spy.calledWithExactly(null, {
                    statusCode: 200,
                    headers: {
                    },
                    body: 'MQ==',
                    isBase64Encoded: true,
                })).toBe(true)
            })

            it('callback aws json body', () => {
                req.env = { AWS_LAMBDA_FUNCTION_NAME: 'f' }
                res.end({ a: 1 })

                expect(req.provider).toBe('aws')
                expect(spy.args[0]).toEqual([null, {
                    statusCode: 200,
                    headers: {
                    },
                    body: '{"a":1}',
                }])
            })
        })
    })
})
