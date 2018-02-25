import os from 'os'

const OS_DEPRECATED_METHODS = ['getNetworkInterfaces', 'tmpDir']

function _try(f) {
    try {
        return f()
    } catch (err) {
        return err.message
    }
}

export function probe() {
    const osReport = Object.keys(os)
        .filter(key => typeof os[key] === 'function')
        .filter(key => OS_DEPRECATED_METHODS.indexOf(key) === -1)
        .reduce((acc, key) => Object.assign(
            acc,
            {
                [`${key}()`]: _try(os[key])
            },
        ), {})

    const processProps = `
        title
        version versions
        arch platform release features
        argv argv0 execArgv execPath execPath
        pid ppid
        moduleLoadList
        config`
        .split(/\s+/)
        .filter(key => !!key)
        .reduce((acc, key) => Object.assign(
            acc,
            {
                [key]: process[key]
            },
        ), {})

    const processMethods = `
        cwd
        umask getuid geteuid getgid getegid getgroups
        hrtime cpuUsage uptime memoryUsage`
        .split(/\s+/)
        .filter(key => !!key)
        .reduce((acc, key) => Object.assign(
            acc,
            {
                [`${key}()`]: _try(process[key])
            },
        ), {})

    const processEnv = Object.keys(process.env)
        .reduce((acc, key) => Object.assign(
            acc,
            {
                [key]: /_(key|token)/i.test(key)
                    ? '***'
                    : process.env[key]
            },
        ), {})

    const processReport = Object.assign(
        {},
        processProps,
        processMethods,
        {
            env: processEnv,
        },
    )

    const data = {
        os: osReport,
        process: processReport,
    }

    try {
        const AWS = require('aws-sdk')
        data['aws-sdk'] = {
            VERSION: AWS.VERSION
        }
    } catch (err) {
    }

    return data
}
