import getConfig from 'next/config'
import { CommonOptions } from '@/cli'

export const getSecrets = (): Pick<CommonOptions, 'key' | 'org' | 'database'> =>
    getConfig().serverRuntimeConfig

export const getOptions = (): Omit<
    CommonOptions,
    'key' | 'org' | 'database' | 'env'
> => getConfig().publicRuntimeConfig
