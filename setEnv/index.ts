/*
Side effect module.
Import and execute env setup functions
*/

import probe from '../probe'

Object.assign(process.env, {
    PROVIDER: probe.provider,
    NODE_ENV: probe.nodeEnv,
})
