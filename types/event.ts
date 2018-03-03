import {
    APIGatewayEvent as AwsAPIGatewayEvent,
    APIGatewayEventRequestContext as AwsAPIGatewayEventRequestContext
} from 'aws-lambda'

export interface QcloudAPIGatewayEventRequestContext 
    extends Pick<AwsAPIGatewayEventRequestContext, 'httpMethod' | 'stage'> {
    path: string
    serviceId: string
    sourceIp: string
    identity: { [name: string]: string }
}

export interface QcloudAPIGatewayEvent
    extends Pick<AwsAPIGatewayEvent, 'httpMethod' | 'path' | 'headers' | 'body'> {
    pathParameters: { [name: string]: string }
    headerParameters: { [name: string]: string }
    queryString: { [name: string]: string }
    queryStringParameters: { [name: string]: string }
    requestContext: QcloudAPIGatewayEventRequestContext

    isBase64Encoded: undefined
}

export interface AliyunAPIGatewayEvent
    extends Pick<AwsAPIGatewayEvent, 'httpMethod' | 'path' | 'headers' | 'body' | 'isBase64Encoded'> {
    pathParameters: { [name: string]: string }
    queryParameters: { [name: string]: string }
}

export type APIGatewayEvent = AwsAPIGatewayEvent | QcloudAPIGatewayEvent | AliyunAPIGatewayEvent

export {
    APIGatewayEvent as AwsAPIGatewayEvent,
    APIGatewayEventRequestContext as AwsAPIGatewayEventRequestContext
} from 'aws-lambda'
