import { Configuration, OpenAIApi } from 'openai'

export const initOpenAI = (apiKey: string, organization?: string) =>
    new OpenAIApi(new Configuration({ apiKey, organization }))
