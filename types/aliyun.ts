import { HttpMethod } from './common'

export interface APIGatewayEvent {
    path: string
    httpMethod: HttpMethod
    headers: { [name: string]: string }
    queryParameters: { [name: string]: string } | null
    pathParameters: { [name: string]: string } | null
}