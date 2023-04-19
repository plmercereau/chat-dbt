# Chat-DBT

A simple prompt to interact with your database using OpenAI ChatGPT.

## Usage

```sh
npx chat-dbt --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

You can also start the Web interface instead of the CLI:

```sh
npx chat-dbt web --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

To get all the available options:

```sh
nxp chat-dbt --help
```

### Environment variables

```sh
export DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
export OPENAI_API_KEY=[your-openai-key]
export OPENAI_ORGANIZATION=[your-openai-org]
npx chat-dbt
```

You can also store your secrets into a `.env` file

```
DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
OPENAI_API_KEY=[your-openai-key]
OPENAI_ORGANIZATION=[your-openai-org]
```

### Use another OpenAI model

<!-- TODO -->

### Ask for confirmation before executing the SQL query

<!-- TODO -->

### Keep context between queries

<!-- TODO -->

### Change the format of the result

<!-- TODO -->

## Development

```sh
# Clone the repository
git clone https://github.com/plmercereau/chat-dbt
cd chat-dbt

# Install Node dependencies
pnpm i

# Create a .env.local file
cp .env.local.example .env.local

# Then, edit the .env.local file to fill your OpenAI API key and organisation

# Start the demo database
docker-compose up -d
```

### Use the Web interface

```sh
pnpm run dev:web
```

### Use the CLI

<!-- TODO nodemon -->

## Roadmap

-   [ ] Complete this readme
-   [ ] Implement the options into the web interface
    -   [ ] confirm
    -   [ ] automatic corrections
    -   [ ] keep-context
-   [ ] Use `inquirer` instead of `prompts` (has an editor prompt, a yes/no/other prompt, and seems easier to tweak to implement history)
-   [ ] Arrow up/down to get the previous queries
    -   [ ] CLI
    -   [ ] Web UI: https://mantine.dev/core/autocomplete/
-   [ ] Editable SQL query before confirmation (and keep the modifications in the history)
-   [ ] Editable SQL query after an error (and keep the modifications in the history)

### To be planned

-   [ ] Use the npm package as a library
-   [ ] Statistics e.g. time per request, tokens used, etc
-   [ ] Web interface in dark/light mode
-   [ ] Add CI tests for both the CLI and the web interface
-   [ ] Nice to have (but complicated): when the context is preserved, allow queries from previous data e.g. "translate the previous result into french"
-   [ ] `--hide-sql`
-   [ ] `--hide-result`
-   [ ] Input from stdin/output to stdout (combined with the above)
-   [ ] Output sql (on success) to file
-   [ ] Output result to file
-   [ ] Verbose level, timestamps etc
-   [ ] Comment the code
