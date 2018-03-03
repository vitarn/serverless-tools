import { Request } from './request'
import { Response } from './response'
import { APIGatewayEvent, Context, Callback } from '../types'

export default (handler: (req: Request, res: Response) => any) => {
    return function (event: APIGatewayEvent, context: Context, callback: Callback) {
        const request = new Request(event, context)
        const response = new Response(callback, request)
        handler(request, response)
    }
}

export * from './request'
export * from './response'
