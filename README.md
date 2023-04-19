# Chat-DBT

## Usage

```sh
npx chat-dbt [options]
npx chat-dbt --help
```

### Command-line interface

```sh
npx chat-dbt --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

### Web interface

```sh
npx chat-dbt web --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

### Use a `.env` file

<!-- TODO -->

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
-   [ ] Changesets + publish
-   [ ] Complete this readme

### Post-release

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
