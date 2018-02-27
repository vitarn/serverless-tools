export class Response {
    private callback: Function
    private statusCode: number
    private headers: { [name: string]: string }
    private body: any

    constructor(callback) {
        this.callback = callback
        this.statusCode = 200
        this.headers = {
            'content-type': 'text/plain'
        }
    }

    get status() {
        return this.statusCode
    }

    set status(code) {
        this.statusCode = code
    }

    setHeader(name, value) {
        this.headers[name] = value
    }

    getHeader(name) {
        return this.headers[name]
    }

    get type() {
        return this.getHeader('content-type')
    }

    set type(value) {
        this.setHeader('content-type', value)
    }

    send(data) {
        if (data === null) {
            this.status = 204
        } else if (typeof data === 'string') {
            this.body = data
        } else if (typeof data === 'object') {
            this.type = 'application/json'
            this.body = data
        }
        this.end()
    }

    end() {
        const response = {
            isBase64Encoded: false,
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
        }
        this.callback(null, response)
    }

    throw(err: Error, status = 500, message?: string) {
        this.status = status
        this.callback(err, {
            message
        })
    }

    assert(value, status = 400, message?: string) {
        if (value) return

        this.status = 400
        this.callback(new Error(message || 'Bad Request'))
    }
}
