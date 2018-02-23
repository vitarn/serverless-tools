/*
Side effect module.
Import and execute env setup functions
*/

import * as setupFunctions from './env'

Object.keys(setupFunctions).forEach(key => setupFunctions[key]())
