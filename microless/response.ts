import http from 'http'
import { Response as HttplessResponse } from '../httpless/response'

export class Response extends HttplessResponse {
    /**
     * Inspect implementation.
     */

    inspect() {
        return this.toJSON()
    }

    /**
     * Return JSON representation.
     */

    toJSON() {
        return {
            statusCode: this.statusCode,
            statusMessage: this.statusMessage,
            headers: this.getHeaders(),
        }
    }
}
