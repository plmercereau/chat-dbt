import { OutputStream } from '@/shared/options'

export const println = (message: string, output: OutputStream) => {
    if (output === 'none') {
        return
    }
    output === 'stdout' ? console.log(message) : console.error(message)
}
