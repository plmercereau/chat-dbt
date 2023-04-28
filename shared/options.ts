export const OUTPUT_STREAMS = ['stdout', 'stderr', 'none'] as const
export type OutputStream = (typeof OUTPUT_STREAMS)[number]

export const RESULT_FORMATS = ['table', 'json', 'csv'] as const
export type ResultFormat = (typeof RESULT_FORMATS)[number]

export const HISTORY_MODES = ['all', 'none', 'queries'] as const
export type HistoryMode = (typeof HISTORY_MODES)[number]
