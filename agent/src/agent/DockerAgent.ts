import type { Job, Tables } from "@mincy/shared";
import Agent from "./baseAgent";
import Docker from "dockerode";
import { mkdir } from "node:fs/promises";
import pino from "pino";
import { PassThrough } from "node:stream";
import { logger } from "../..";


export default class DockerAgent extends Agent {
    /**
     * Ensures the Docker image exists locally, pulls it if it doesn't
     */
    private async ensureImageExists(docker: Docker, imageName: string): Promise<void> {
        try {
            // Try to inspect the image to see if it exists
            await docker.getImage(imageName).inspect();
            logger.info(`Image ${imageName} already exists locally`);
        } catch (error: any) {
            if (error.statusCode === 404) {
                // Image doesn't exist, pull it
                logger.info(`Image ${imageName} not found locally, pulling...`);
                try {
                    const stream = await docker.pull(imageName);
                    
                    // Wait for the pull to complete
                    await new Promise((resolve, reject) => {
                        docker.modem.followProgress(stream, (err, res) => {
                            if (err) {
                                logger.error({ error: err }, `Failed to pull image ${imageName}`);
                                reject(err);
                            } else {
                                logger.info(`Successfully pulled image ${imageName}`);
                                resolve(res);
                            }
                        });
                    });
                } catch (pullError) {
                    logger.error({ error: pullError }, `Failed to pull image ${imageName}`);
                    throw pullError;
                }
            } else {
                // Some other error occurred
                logger.error({ error }, `Error checking image ${imageName}`);
                throw error;
            }
        }
    }

    override async execute(workflow: Tables<"Workflow">) {
        // create a random folder to mount during the entire time 
        const executor = new Docker()
        const hashed_id = Bun.hash(`${workflow.id}_${workflow.project_id}_${Date.now()}`)
        const currDir = `${this.workdir}/${hashed_id}`
        await mkdir(currDir)
        const jobs = workflow.jobs as unknown as [Job];

        for (let job of jobs) {
            const stdout = new PassThrough();
            const stderr = new PassThrough();

            // Check if image exists, pull if it doesn't
            await this.ensureImageExists(executor, job.image);

            const container = await executor.createContainer({
                Image: job.image,
                Cmd: job.cmd,
                name: job.name + hashed_id + Date.now(),
                WorkingDir: currDir,
                // Env: workflow.environment as [string],
                HostConfig: {
                    Binds: [`${currDir}:/workspace`]
                },
            }, (err, container) => {
                if (err) throw err;
                                    container?.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
                        if (err) throw err
                        container.modem.demuxStream(stream, stdout, stderr);

                        stdout.on("data", (chunk) => {
                            const line = chunk.toString().trim();
                            if (line)
                                logger.error(line);
                        })

                        stderr.on("data", (chunk) => {
                            const line = chunk.toString().trim();
                            if (line) logger.error(line)
                        })
                    })
                

                container?.start().then(
                    ()=> container.remove()
                )
                

            })
        }
    }
}