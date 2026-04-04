import { mkdir } from "node:fs/promises";
import { PassThrough } from "node:stream";
import Docker from "dockerode";
import { logger } from "../..";
import type { Executor, JobContext } from "./executor";
import { BatchLogger } from "../logger/logger";
import type { Run, Step } from "@mincy/shared";

const DEFAULT_IMAGE = "debian:latest";

export default class DockerExecutor implements Executor {
    workdir: string;
    readonly server: string;
    readonly token: string;
    private readonly docker: Docker;

    constructor(workdir: string, server: string, token: string) {
        this.workdir = workdir
        this.server = server
        this.token = token
        this.docker = new Docker({
            socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
        })
    }

    async execute(run: Run): Promise<number> {
        const hashedId = Bun.hash(`${run.id}_${run.project_id}}`);
        const workdir = `${this.workdir}/${hashedId}`;
        await mkdir(workdir, { recursive: true });

        for (const job of run.workflow.jobs.steps) {
            const context: JobContext = {
                workflowId: run.workflow.id,
                jobId: job.id,
                runId: run.id
            }

            const exitCode = await this.runJob(context, job, workdir, hashedId);
            if (exitCode !== 0) {
                logger.error(`Job ${job.id} failed with exit code: ${exitCode}`);
                return exitCode;
            }

        }
        return 0;
    }

    private async runJob(context: JobContext, job: Step, workdir: string, hashedId: bigint | number): Promise<number> {

        const jobLogger = new BatchLogger(context, this.token, this.server, 10, 1000)
        if (!job.data?.config && !job.data?.config?.cmd){
            return 0;
        }

        const image = DEFAULT_IMAGE
        await this.ensureImageExists(image);

        const stdout = new PassThrough();
        const stderr = new PassThrough();

        this.pipeToLogger(stdout, "info", jobLogger);
        this.pipeToLogger(stderr, "error", jobLogger);
        logger.info(job.data.config?.cmd);
        const exitCode = await new Promise<number>((resolve, reject) => {
            this.docker.createContainer(
                {
                    Image: image,
                    Cmd: job.data?.config?.cmd,
                    name: `mincy_${hashedId}_${job.id}`,
                    WorkingDir: "/workspace",
                    HostConfig: {
                        Binds: [`${workdir}:/workspace`],
                    },
                },
                (err, container) => {
                    if (err || !container) return reject(err ?? new Error("Container creation failed"));

                    container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
                        if (err || !stream) return reject(err ?? new Error("Failed to attach to container"));
                        container.modem.demuxStream(stream, stdout, stderr);
                    });

                    container
                        .start()
                        .then(() => container.wait())
                        .then((result) => container.remove()
                            .then(() => resolve(result.StatusCode))) // preserve result across remove()
                        .catch(reject);
                },
            );
        });

        await jobLogger.flush();
        return exitCode;
    }

    private pipeToLogger(stream: PassThrough, level: "info" | "error", jobLogger: BatchLogger): void {
        stream.on("data", (chunk: Buffer) => {
            const line = chunk.toString().trim();
            if (line){
                jobLogger.log(level, line)
            }
        });
    }

    private async ensureImageExists(imageName: string): Promise<void> {
        try {
            const stream = await this.docker.pull(imageName);
            await new Promise<void>((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err) => {
                    if (err) {
                        logger.error({ error: err }, `Failed to pull image ${imageName}`);
                        reject(err);
                    } else {
                        logger.info(`Successfully pulled image ${imageName}`);
                        resolve();
                    }
                });
            });
        } catch (err) {
            logger.error({ error: err }, `Failed to pull image ${imageName}`);
            throw err;
        }
    }
}