/*
Side effect module.
Import and execute env setup functions
*/

import { evaluate } from '../evaluate'

const report = evaluate()

Object.assign(process.env, {
    PROVIDER: report.provider,
    NODE_ENV: report.nodeEnv,
})
