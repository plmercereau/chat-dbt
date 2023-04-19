# Roadmap

-   [ ] Complete the readme file
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

## To be planned

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