# Roadmap

-   Complete the readme file:
    -   explaination
    -   limitations
        -   security
        -   access to DB data
        -   other databases
        -   Link to roadmap, and contribute

## To be planned

-   Vitests
-   Implement the options into the web interface
    -   confirm
    -   automatic corrections
    -   keep-context
    -   Editable SQL query before confirmation (and keep the modifications in the history)
    -   Editable SQL query after an error
    -   Editable prompt query after an error
-   Use the npm package as a library
-   Keep the modifications of the edited SQL query in the history
-   Statistics e.g. time per request, tokens used, etc
-   Dark/light mode toggle
-   Add CI tests for both the CLI and the web interface
-   Nice to have (but complicated): when the context is preserved, allow queries from previous data e.g. "translate the previous result into french"
-   `--hide-sql`
-   `--hide-result`
-   Input from stdin/output to stdout (combined with the above)
-   Output sql (on success) to file
-   Output result to file
-   Verbose level, timestamps etc
-   Comment the code
