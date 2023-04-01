#!/usr/bin/env node
import { Option } from '@commander-js/extra-typings'
import { startWeb } from './web'
import { envProgram } from './env'
import { parseInteger } from './utils'

const program = envProgram
    .name('chat-dbt')

    .addOption(
        new Option(
            '-d, --database <connection-string>',
            'database connection string, for instance "postgres://user:password@host:port/database"'
        )
            .env('DB_CONNECTION_STRING')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('-k, --key <key>', 'OpenAI key')
            .env('OPENAI_API_KEY')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('-o, --org <org>', 'OpenAI organization')
            .env('OPENAI_ORGANIZATION')
            .makeOptionMandatory(true)
    )

program.configureHelp().showGlobalOptions = true

program
    .command('web')
    .option('-p, --port <number>', 'port number', parseInteger, 3000)
    .option('-n, --no-browser', 'do not open the browser', true)
    .action(options => {
        const { database } = program.opts()
        const { browser, port } = options
        startWeb({
            port,
            browser,
            database
        })
    })

program.action(options => {
    const { database } = options
    console.log('prompt', database)
    // const globalOptions = program.opts()
    // console.log(globalOptions)
})
program.parse()
