import { mkdir } from "node:fs/promises";
import { PassThrough } from "node:stream";
import Docker from "dockerode";
import type { Job } from "@mincy/shared";
import { logger } from "../..";
import type { Executor } from "./executor";
import type { Run } from "../agent/baseAgent";

const DEFAULT_IMAGE = "debian:latest";

export default class DockerExecutor implements Executor {
    containers: Docker.Container[] = [];
    cleanup(){}
    streamLogs(){}

    prepare(): void {}
    workdir: string;

    constructor(workdir: string){
        this.workdir = workdir
    }

    async execute(workflow: Run): Promise<void> {
        const docker = new Docker();
        const hashedId = Bun.hash(`${workflow.id}_${workflow.project_id}_${Date.now()}`);
        const workdir = `${this.workdir}/${hashedId}`;

        await mkdir(workdir, { recursive: true });

        for (let job of workflow.workflow.jobs.steps) {
            this.runJob(docker, job, workdir, hashedId);
        }
    }

    private async runJob(docker: Docker, job: Job, workdir: string, hashedId: bigint | number): Promise<void> {
        
        if (!job.data?.config && !job.data?.config?.cmd){
            return
        }

        // const image = job.executor.image ?? DEFAULT_IMAGE;
        const image = DEFAULT_IMAGE
        await this.ensureImageExists(docker, image);

        const stdout = new PassThrough();
        const stderr = new PassThrough();

        this.pipeToLogger(stdout, "info");
        this.pipeToLogger(stderr, "error");
        logger.info(job.data.config.cmd)
        await new Promise<void>((resolve, reject) => {
            docker.createContainer(
                {
                    Image: image,
                    Cmd: job.data.config.cmd,
                    name: `${job.id}_${hashedId}_${Date.now()}`,
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
                        .then(() => container.remove())
                        .then(resolve)
                        .catch(reject);
                },
            );
        });
    }

    private pipeToLogger(stream: PassThrough, level: "info" | "error"): void {
        stream.on("data", (chunk: Buffer) => {
            const line = chunk.toString().trim();
            if (line) logger[level](line);
        });
    }

    private async ensureImageExists(docker: Docker, imageName: string): Promise<void> {
        try {
            const stream = await docker.pull(imageName);
            await new Promise<void>((resolve, reject) => {
                docker.modem.followProgress(stream, (err) => {
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