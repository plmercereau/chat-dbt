import { InvalidArgumentError } from '@commander-js/extra-typings'

export const parseInteger = (value: string): number => {
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError(`${value} is not a number`)
    }
    return parsedValue
}
