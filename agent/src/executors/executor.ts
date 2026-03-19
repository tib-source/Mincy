import type { Run } from "../agent/baseAgent"

export interface Executor {
    prepare: () => void
    execute: (workflow: Run) => Promise<void>
    streamLogs: () => void
    cleanup: () => void
}