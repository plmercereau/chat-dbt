#!/usr/bin/env node
import { createOption } from '@commander-js/extra-typings'

import { HISTORY_MODES, OUTPUT_STREAMS, RESULT_FORMATS } from '@/shared'

import { startCLI } from './cli'
import { envProgram } from './env'
import { parseInteger } from './utils'
import { startWeb } from './web'

const program = envProgram
    .name('chat-dbt')
    .addOption(
        createOption(
            '-d, --database <connection-string>',
            'database connection string, for instance "postgres://user:password@localhost:5432/postgres"'
        )
            .env('DB_CONNECTION_STRING')
            .makeOptionMandatory(true)
    )
    .addOption(
        createOption('--key <key>', 'OpenAI key')
            .env('OPENAI_API_KEY')
            .makeOptionMandatory(true)
    )
    .addOption(
        createOption('--org <org>', 'OpenAI organization').env(
            'OPENAI_ORGANIZATION'
        )
    )
    .addOption(
        createOption('-m, --model <model>', 'model to use').default('gpt-4')
    )
    .addOption(
        createOption(
            '-c, --confirm',
            'ask confirmation before running the SQL query'
        ).default(false)
    )
    .addOption(
        createOption(
            '-a, --auto-correct <number>',
            'number of calls to OpenAI for correcting an error in the SQL query'
        )
            .default(0)
            .argParser(parseInteger)
    )
    .addOption(
        createOption(
            '-t, --history-mode <choice>',
            'part of the previous queries to keep in the context: all, none, or only the queries without their results'
        )
            .choices(HISTORY_MODES)
            .default('all' as const)
    )
    .addOption(
        createOption('-f, --format <format>', 'format of the result')
            .choices(RESULT_FORMATS)
            .default('table' as const)
    )
    .addOption(
        createOption('--output-sql <output>', 'output stream for the SQL query')
            .choices(OUTPUT_STREAMS)
            .default('stdout' as const)
    )
    .addOption(
        createOption(
            '--output-result <output>',
            'output stream for the SQL result'
        )
            .choices(OUTPUT_STREAMS)
            .default('stdout' as const)
    )
    .addOption(
        createOption(
            '--output-info <output>',
            'output stream for information messages'
        )
            .choices(OUTPUT_STREAMS)
            .default('stderr' as const)
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

program.action(options => {
    return startCLI({ ...program.opts(), ...options })
})

program.parse()
