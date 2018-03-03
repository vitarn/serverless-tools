import { Callback as AwsCallback } from 'aws-lambda'

export type Callback = AwsCallback<{
    isBase64Encoded: boolean
    statusCode: number
    headers: { [header: string]: string }
    body: string | object
}>
