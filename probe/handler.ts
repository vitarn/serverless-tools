import { probe } from './probe'

export function handler(event, context, callback) {
    const data = Object.assign(
        {
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
