# Chat-DBT

A simple prompt for interacting with your database using OpenAI ChatGPT.

## Installation

```sh
npm i -g chat-dbt
```

## Usage

```sh
chat-dbt [options]
chat-dbt web [options]
chat-dbt --help
```

### Command-line interface

```sh
chat-dbt --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

### Web interface

```sh
chat-dbt web --database postgres://user:password@localhost:5432/postgres --key [your-openai-key] --org [your-openai-org]
```

## Options

### Environment variables

```sh
export DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
export OPENAI_API_KEY=[your-openai-key]
export OPENAI_ORGANIZATION=[your-openai-org]
chat-dbt
```

Chat-DBT will also read the secrets mentioned above from a `.env` file, if it exists:

```
DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
OPENAI_API_KEY=[your-openai-key]
OPENAI_ORGANIZATION=[your-openai-org]
```

You can also pass a different dotenv file name as an option:

```sh
chat-dbt --env .env.custom
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

### Develop the Web interface

```sh
pnpm run dev:web
```

### Develop the CLI

<!-- TODO nodemon -->
