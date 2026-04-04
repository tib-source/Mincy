import type { Run } from "../agent/baseAgent"

export interface JobContext {
    workflowId: string
    jobId: string
    runId: string
}


export interface Executor {
    prepare: () => void
    execute: (workflow: Run) => Promise<number>
    streamLogs: () => void
    cleanup: () => void
}