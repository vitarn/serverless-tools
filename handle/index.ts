import { Request } from './request'
import { Response } from './response'

export default (handler: (req: Request, res: Response) => any): (event, context, callback: Function) => any => {
    return function (event, context, callback) {
        const request = new Request(event, context)
        const response = new Response(callback)
        handler(request, response)
    }
}
