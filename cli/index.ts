#!/usr/bin/env node
import { Option } from '@commander-js/extra-typings'

import { startCLI } from './cli'
import { envProgram } from './env'
import { parseInteger } from './utils'
import { startWeb } from './web'

const program = envProgram
    .name('chat-dbt')
    .addOption(
        new Option(
            '-c, --keep-context',
            'keep context between queries'
        ).default(false)
    )
    .addOption(
        new Option(
            '-r, --retries <number>',
            'number of automatic retries after a failed query'
        )
            .argParser(parseInteger)
            .default(3)
    )
    .addOption(
        new Option(
            '-d, --database <connection-string>',
            'database connection string, for instance "postgres://user:password@localhost:5432/postgres"'
        )
            .env('DB_CONNECTION_STRING')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('-k, --api-key <key>', 'OpenAI key')
            .env('OPENAI_API_KEY')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('-o, --organization <org>', 'OpenAI organization')
            .env('OPENAI_ORGANIZATION')
            .makeOptionMandatory(true)
    )
export type CommonOptions = ReturnType<typeof program.opts>

program.configureHelp().showGlobalOptions = true

const web = program
    .command('web')
    .option(
        '-p, --port <number>',
        'port number of the web interface',
        parseInteger,
        3000
    )
    .option('-n, --no-browser', 'do not open the browser', true)
    .action(options => {
        startWeb({ ...program.opts(), ...options })
    })

export type WebOptions = CommonOptions & ReturnType<typeof web.opts>

const cli = program
    .addOption(
        new Option('-f, --format <format>', 'format of the result')
            .choices(['table', 'json'])
            .default('table')
    )
    .action(async options => {
        await startCLI({ ...program.opts(), ...options })
    })

export type CLIOptions = CommonOptions & ReturnType<typeof cli.opts>

program.parse()
