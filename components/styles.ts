import { createStyles } from '@mantine/core'

export const useStyles = createStyles(theme => {
    return {
        code: {
            paddingRight: '30px',
            whiteSpace: 'pre-wrap'
        },
        left: {
            alignSelf: 'flex-start',
            borderRadius: '0px 10px 10px 10px',
            maxWidth: '100%'
        },
        right: {
            alignSelf: 'flex-end',
            borderRadius: '10px 0px 10px 10px',
            maxWidth: '100%'
        },
        flex: {
            padding: theme.spacing.xs,
            gap: theme.spacing.xs
        }
    }
})
