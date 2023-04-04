# Chat-DBT

## TODO

-   [ ] Editable SQL query before confirmation (and keep the modifications in the history)
-   [ ] Editable SQL query after an error (and keep the modifications in the history)
-   [ ] Verbose level
    -   [ ] timestamps
-   [ ] `--hide-sql`
-   [ ] `--hide-result`
-   [ ] Output sql (on success) to file
-   [ ] Output result to file
-   [ ] Input from stdin/output to stdout (combined with the above)
-   [ ] Nice to have (but complicated): when the context is preserved, allow queries from previous data e.g. "translate the previous result into french"
-   [ ] Implement the options into the web interface
    -   [ ] confirm
    -   [ ] retries
    -   [ ] keep-context
-   [ ] Web interface in dark/light mode
-   [ ] Arrow up/down to get the previous queries
-   [ ] Add CI tests for both the CLI and the web interface
-   [ ] Changesets + publish
-   [ ] Complete this readme
-   [ ] Comment the code

## Done

-   [x] Add a `--confirm` option to prompt the user before executing the query
-   [x] Add a `--model` option to choose the OpenAI model
-   [x] Spinner
