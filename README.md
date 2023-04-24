# Chat-DBT

Interact with your database using human-like queries through OpenAI GPT.

https://user-images.githubusercontent.com/24897252/233864066-2110a65e-3337-40c2-a1e5-3756e21d6ed6.mp4

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
chat-dbt --database postgres://user:password@localhost:5432/postgres --key your-openai-key
```

### Web interface

```sh
chat-dbt web --database postgres://user:password@localhost:5432/postgres --key your-openai-key
```

https://user-images.githubusercontent.com/24897252/233865764-2a8c4716-f052-47f5-9e48-0ec3a4cc818f.mp4

## Handling of errors

Sometimes OpenAI's response may include an incorrect SQL query that fails. In such cases, you have the following options:

-   Retry: In this case, the error will be sent back to OpenAI, and it will be asked to correct its response.
-   Edit prompt: You can reformulate the request to OpenAI for it to adjust its response.
-   Edit SQL: You can manually change the SQL query generated by OpenAI to correct its error and then execute it.

## Options

### Environment variables

```sh
export DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
export OPENAI_API_KEY=your-openai-key
export OPENAI_ORGANIZATION=your-openai-organisation
chat-dbt
```

Chat-DBT will also read the secrets mentioned above from a `.env` file, if it exists:

```
DB_CONNECTION_STRING=postgres://user:password@localhost:5432/postgres
OPENAI_API_KEY=your-openai-key
OPENAI_ORGANIZATION=your-openai-organisation
```

You can also pass a different `.env` file name as an option:

```sh
chat-dbt --env .env.custom
```

### Use another OpenAI model

The OpenAI model is set to `gpt-4` by default. You can choose another chat model with the `--model` option, for instance:

```sh
chat-dbt --model gpt-3.5-turbo
```

You can have a look at the [list of compatible chat completion models in the OpenAI documentation](https://platform.openai.com/docs/models/model-endpoint-compatibility).

### Ask for confirmation before executing the SQL query

You may not feel comfortable executing a query before previewing it. To preview the SQL query and confirm before running it, use the `--confirm` option. This option prompts you for confirmation and allows you to modify the SQL query if needed before its execution.

```sh
chat-dbt --confirm
```

### Auto-correct errors

It is possible to automatically request corrections from OpenAI while sending errors back to it. This feature is deactivated by default, but you can enable it by using the `--auto-correct nb-attempts` flag, where `nb-attempts` is the number of attempts OpenAI will have to solve the error.

Each attempt is iterative and builds upon the previous ones, so OpenAI is supposed to take the context into account to reach a successful query eventually.

```sh
chat-dbt --auto-correct 3
```

### Skip history between queries

By default, Chat-DBT keeps the history of the previous exchanges with the new prompt sent to OpenAI.It gives more context to OpenAI and allows queries using previous results. On the other hand, it uses more tokens and is therefore more costly. You can either disable the history with the `--history-mode=none` option, or only keep the previous queries without sending their database result with the `--history-mode=queries` option.

```sh
chat-dbt --history-mode=[all|none|queries]
```

Please note that the previous query will however always be sent when you asked to retry a query that failed.

<!-- TODO explain a bit further why this feature is powerful, but why it costs an arm -->

### Change the format of the result

By default, Chat-DBT renders the results as a table. To obtain the results in JSON format, pass the following option:

```sh
chat-dbt --format json
```

<!-- TODO IO streams -->

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

### Develop the CLI

```sh
pnpm run dev:cli
```

### Develop the Web interface

```sh
pnpm run dev:web
```
