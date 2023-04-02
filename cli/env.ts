import { Command } from '@commander-js/extra-typings'
import { config } from 'dotenv'

// * Create a basic program to parse the .env argument
export const envProgram = new Command().option(
    '-e, --env <filename>',
    'dotenv environment file',
    '.env'
)

// * Allow any option that will be used by the main program, and deactivate the help option
envProgram.allowUnknownOption(true).helpOption(false)

// * Parse the arguments a first time to set environment variables
envProgram.parse()
// * Load the .env file
config({ path: envProgram.opts().env })

const {
    POSTGRES_HOST,
    POSTGRES_USER,
    POSTGRES_DB,
    POSTGRES_PORT = 5432,
    POSTGRES_PASSWORD,
    DB_CONNECTION_STRING
} = process.env

if (
    !DB_CONNECTION_STRING &&
    POSTGRES_HOST &&
    POSTGRES_USER &&
    POSTGRES_DB &&
    POSTGRES_PASSWORD
) {
    // * Set the DB_CONNECTION_STRING if it is not already set
    process.env.DB_CONNECTION_STRING = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
}

// * Restore the default behaviour for the main program: activate help and make sure no unknown option is allowed
envProgram.allowUnknownOption(false).helpOption(true)
