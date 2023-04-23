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
            '-d, --database <connection-string>',
            'database connection string, for instance "postgres://user:password@localhost:5432/postgres"'
        )
            .env('DB_CONNECTION_STRING')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--key <key>', 'OpenAI key')
            .env('OPENAI_API_KEY')
            .makeOptionMandatory(true)
    )
    .addOption(
        new Option('--org <org>', 'OpenAI organization').env(
            'OPENAI_ORGANIZATION'
        )
    )
    .addOption(
        new Option('-m, --model <model>', 'model to use').default('gpt-4')
    )
    .addOption(
        new Option(
            '-c, --confirm',
            'ask confirmation before running the SQL query'
        ).default(false)
    )
    .addOption(
        new Option(
            '-a, --auto-correct <number>',
            'number of calls to OpenAI for correcting an error in the SQL query'
        ).argParser(parseInteger)
    )
    .addOption(
        new Option(
            '-k, --keep-context',
            'keep context between queries'
        ).default(false)
    )
    .addOption(
        new Option('-f, --format <format>', 'format of the result')
            .choices(['table', 'json'])
            .default('table')
    )

export type CommonOptions = ReturnType<typeof program.opts>

type SecretOptionKeys = 'key' | 'org' | 'database'
export type PublicOptions = Omit<CommonOptions, SecretOptionKeys | 'env'>
export type SecretOptions = Pick<CommonOptions, SecretOptionKeys>

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

program.action(async options => {
    await startCLI({ ...program.opts(), ...options })
})

program.parse()
