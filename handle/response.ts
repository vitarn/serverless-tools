export class Response {
    headers: { [name: string]: string }
    body: any
    statusCode: number
    callback: Function

    constructor(callback) {
        this.headers = {}
        this.statusCode = 200
        this.callback = callback
    }

    set type(value) {
        this.headers['content-type'] = value
    }

    set status(code) {
        this.statusCode = code
    }

    send(data) {
        if (typeof data === 'string') {
            this.headers['content-type'] = this.headers['content-type'] || 'text/plain'
            this.body = data
        } else if (typeof data === 'object') {
            this.headers['content-type'] = this.headers['content-type'] || 'application/json'
            this.body = JSON.stringify(data)
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

    error(err, status = 500) {
        this.status = status
        this.callback(err)
    }
}