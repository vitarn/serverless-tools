import sinon from 'sinon'
import microless, { buffer, text, json, send, sendError, createError, compose, Enhancer } from '../microless'
import { Request } from '../microless/request'
import { Response } from '../microless/response'
import { create } from 'domain';

describe('microless', () => {
    describe('buffer', () => {
        it('throw if create buffer from req event undefined body', async () => {
            const req = new Request({} as any, {} as any)

            await expect(buffer(req)).rejects.toThrow()
        })

        it('create buffer from req event string body', async () => {
            const req = new Request({ body: '123' } as any, {} as any)

            await expect(buffer(req)).resolves.toEqual(new Buffer('123'))
        })

        it('create buffer from req event base64 encoded body', async () => {
            const req = new Request({ body: 'MTIz', isBase64Encoded: true } as any, {} as any)

            await expect(buffer(req)).resolves.toEqual(new Buffer('123'))
        })
    })

    describe('text', () => {
        it('read text from req event undefined body', async () => {
            const req = new Request({} as any, {} as any)

            await expect(text(req)).resolves.toBeUndefined()
        })

        it('read text from req event string body', async () => {
            const req = new Request({ body: '123' } as any, {} as any)

            await expect(text(req)).resolves.toEqual('123')
        })

        it('read text from req event base64 encoded body', async () => {
            const req = new Request({ body: 'MTIz', isBase64Encoded: true } as any, {} as any)

            await expect(text(req)).resolves.toEqual('123')
        })

        it('throw if read text from req event base64 encoded undefined body', async () => {
            const req = new Request({ isBase64Encoded: true } as any, {} as any)

            await expect(text(req)).rejects.toThrow()
        })
    })

    describe('json', () => {
        it('throw if parse json from req event undefined body', async () => {
            const req = new Request({} as any, {} as any)

            await expect(json(req)).rejects.toThrow()
        })

        it('parse json from req event string body', async () => {
            const req = new Request({ body: '{"a":1}' } as any, {} as any)

            await expect(json(req)).resolves.toEqual({ a: 1 })
        })

        it('parse json from req event base64 encoded body', async () => {
            const req = new Request({ body: 'eyJhIjoxfQ==', isBase64Encoded: true } as any, {} as any)

            await expect(json(req)).resolves.toEqual({ a: 1 })
        })
    })

    describe('Request', () => {
        let req = new Request(
            {
                httpMethod: 'GET',
                path: '/hello',
                queryStringParameters: { a: 1 },
                queryParameters: {},
                pathParameters: null,
                stageVariables: null,
                headers: {
                    Host: 'example.com',
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': '0',
                    'X-Forwarded-For': '1.1.1.1, 2.2.2.2',
                    'X-Forwarded-Proto': 'https',
                },
                body: null,
                isBase64Encoded: false,
            }, {
            } as any
        )

        it('enhance request similar koa', () => {
            expect(req.origin).toBe('https://example.com')
            expect(req.href).toBe('https://example.com/hello?a=1')
            expect(req.path).toBe('/hello')
            expect(req.query).toEqual({ a: 1 })
            expect(req.querystring).toBe('a=1')
            expect(req.search).toBe('?a=1')
            expect(req.host).toBe('example.com')
            expect(req.hostname).toBe('example.com')
            expect(req.idempotent).toBe(true)
            expect(req.length).toBe(0)
            expect(req.protocol).toBe('https')
            expect(req.secure).toBe(true)
            expect(req.ips).toEqual(['1.1.1.1', '2.2.2.2'])
            expect(req.type).toBe('application/json')
        })
    })

    describe('createError', () => {

    })

    describe('microless', () => {
        let spy: sinon.SinonSpy = sinon.spy()

        beforeEach(() => {
            spy = sinon.spy()
        })

        it('return string', async () => {
            await microless(() => 'ok')({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 200,
                headers: {},
                body: 'ok',
            }])
        })

        it('send string', async () => {
            await microless((req, res) => {
                send(res, 200, 'ok')
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 200,
                headers: {},
                body: 'ok',
            }])
        })

        it('return null', async () => {
            await microless((req, res) => {
                return null
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 204,
                headers: {},
                body: '',
            }])
        })

        it('send null', async () => {
            await microless((req, res) => {
                send(res, 200, null)
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 200,
                headers: {},
                body: '',
            }])
        })

        it('return object', async () => {
            await microless((req, res) => {
                return { msg: 'ok' }
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 200,
                headers: {
                    'content-type': 'application/json; charset=utf-8',
                },
                body: { msg: 'ok' },
            }])
        })

        it('throw string', async () => {
            await microless((req, res) => {
                throw 'no'
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 500,
                headers: {},
                body: {
                    message: 'Internal Server Error',
                },
            }])
        })

        it('throw number', async () => {
            await microless((req, res) => {
                throw 1
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 500,
                headers: {},
                body: {
                    error: 1,
                },
            }])
        })

        it('throw null', async () => {
            await microless((req, res) => {
                throw null
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 500,
                headers: {},
                body: '',
            }])
        })

        it('throw error', async () => {
            await microless((req, res) => {
                let err = new Error('plz signin') as any
                err.statusCode = 401
                throw err
            })({} as any, {} as any, spy)

            // console.log(spy.args)
            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'Error',
                    message: 'plz signin',
                },
            }])
        })

        it('throw expose error', async () => {
            await microless((req, res) => {
                let err = new Error('plz signin') as any
                err.statusCode = 401
                err.expose = true
                throw err
            })({} as any, {} as any, spy)

            // console.log(spy.args)
            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'Error',
                    message: 'plz signin',
                },
            }])
        })

        it('throw http 4xx error', async () => {
            await microless((req, res) => {
                throw createError(401, 'plz signin')
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'UnauthorizedError',
                    message: 'plz signin',
                },
            }])
        })

        it('throw http 5xx error', async () => {
            await microless((req, res) => {
                throw createError(501, 'oops')
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 501,
                headers: {},
                body: {
                    name: 'NotImplementedError',
                    message: 'Internal Server Error',
                },
            }])
        })

        it('throw expose http 5xx error', async () => {
            await microless((req, res) => {
                throw createError(501, 'oops', {
                    expose: true,
                })
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 501,
                headers: {},
                body: {
                    name: 'NotImplementedError',
                    message: 'oops',
                },
            }])
        })

        it('throw http 4xx error as text', async () => {
            await microless((req, res) => {
                throw createError(401, 'plz signin', {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                })
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {
                    'content-type': 'text/plain',
                },
                body: 'plz signin',
            }])
        })

        it('throw http 4xx error as json', async () => {
            await microless((req, res) => {
                throw createError(401, 'plz signin', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    name: 'UnauthorizedError',
                    message: 'plz signin',
                },
            }])
        })

        it('send error', async () => {
            await microless((req, res) => {
                let err = new Error('plz signin') as any
                err.statusCode = 401
                sendError(req, res, err)
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'Error',
                    message: 'plz signin',
                },
            }])
        })

        it('send expose error', async () => {
            await microless((req, res) => {
                let err = new Error('plz signin') as any
                err.statusCode = 401
                err.expose = true
                sendError(req, res, err)
            })({} as any, {} as any, spy)

            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'Error',
                    message: 'plz signin',
                },
            }])
        })

        it('send http error', async () => {
            await microless((req, res) => {
                sendError(req, res, createError(401, 'plz signin'))
            })({} as any, {} as any, spy)

            // console.log(spy.args)
            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {},
                body: {
                    name: 'UnauthorizedError',
                    message: 'plz signin',
                },
            }])
        })

        it('send http error as text', async () => {
            await microless((req, res) => {
                sendError(req, res, createError(401, 'plz signin', {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                }))
            })({} as any, {} as any, spy)

            // console.log(spy.args)
            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {
                    'content-type': 'text/plain',
                },
                body: 'plz signin',
            }])
        })

        it('send http error as json', async () => {
            await microless((req, res) => {
                sendError(req, res, createError(401, 'plz signin', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }))
            })({} as any, {} as any, spy)

            // console.log(spy.args)
            expect(spy.args[0]).toEqual([null, {
                statusCode: 401,
                headers: {
                    'content-type': 'application/json',
                },
                body: {
                    name: 'UnauthorizedError',
                    message: 'plz signin',
                },
            }])
        })
    })

    xdescribe('microless compose', () => {
        it('accept cloud function arguments', async () => {
            const enhanceType: Enhancer<Request & { type: string }, Response & {}> = fn => (req, res) => {
                Object.assign(req, {
                    get type() {
                        return req.headers['content-type']
                    }
                })
                return fn(req, res)
            }
            type E<Q extends Request, S extends Response> = (fn: (req, res) => any) => (req, res) => any
            const enhanceLength: E<Request, Response> = fn => (req: Request, res) => {
                const req2 = Object.assign(req, {
                    get length() {
                        return parseInt(req.headers['content-length'])
                    }
                })
                return fn(req2, res)
            }

            const enhancer = compose(
                microless,
                enhanceType,
                enhanceLength,
            )

            enhancer((req) => {
                console.log({
                    type: req.type,
                    length: req.length,
                })
                return 'ok'
            })(
                {
                    headers: {
                        'content-type': 'text/plain',
                        'content-length': '11',
                    },
                } as any,
                {} as any,
                console.log
            )

            // const enhance = microless((req) => {
            //     return 'ok'
            // })

            const getType = fn => (req, res) => {
                Object.assign(req, {
                    get type() {
                        return req.headers['content-type']
                    }
                })
                return fn(req, res)
            }
            const getLength = fn => (req: Request, res) => {
                Object.assign(req, {
                    get length() {
                        return parseInt(req.headers['content-length'])
                    }
                })
                return fn(req, res)
            }
            const handler = fn => microless(getType(getLength(fn)))
        })
    })
})
