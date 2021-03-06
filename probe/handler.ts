import { probe } from './probe'

const packageJSON = require('../package')

export function handler(event, context, callback) {
    const data = Object.assign(
        {
            title: `Probe report - generated by ${packageJSON.name}`,
            event,
            context,
        },
        probe(),
    )

    if (typeof context.remainingTimeInMillis === 'function') {
        data.context.remainingTimeInMillis = context.getRemainingTimeInMillis()
    }

    callback(null, {
        body: JSON.stringify(data)
    })
}
