export const getConnectionStringFromEnv = () => {
    const {
        POSTGRES_HOST,
        POSTGRES_USER,
        POSTGRES_DB,
        POSTGRES_PORT = 5432,
        POSTGRES_PASSWORD
    } = process.env

    if (POSTGRES_HOST && POSTGRES_USER && POSTGRES_DB && POSTGRES_PASSWORD) {
        return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
    }
}
