import { Request } from './request'
import { Response } from './response'

export default function(handler) {
    return function (event, context, callback) {
        const request = new Request(event, context)
        const response = new Response(callback)
        handler(request, response)
    }
}
