import getConfig from 'next/config'
import { PublicOptions, SecretOptions } from '@/cli'

export const getSecrets = (): SecretOptions => getConfig().serverRuntimeConfig

export const getOptions = (): PublicOptions => getConfig().publicRuntimeConfig
