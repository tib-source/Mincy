import { mkdir } from "node:fs/promises";
import { PassThrough } from "node:stream";
import Docker from "dockerode";
import { logger } from "../..";
import type { Executor, JobContext } from "./executor";
import { BatchLogger } from "../logger/logger";
import type { Run, Stage, Step } from "@mincy/shared";

export default class DockerExecutor implements Executor {
	workdir: string;
	readonly server: string;
	readonly token: string;
	private readonly docker: Docker;

	constructor(workdir: string, server: string, token: string) {
		this.workdir = workdir;
		this.server = server;
		this.token = token;
		this.docker = new Docker({
			socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
		});
	}

	async execute(run: Run): Promise<number> {
		const hashedId = Bun.hash(`${run.id}_${run.project_id}}`);
		const workdir = `${this.workdir}/${hashedId}`;
		await mkdir(workdir, { recursive: true });

		for (const stage of run.workflow.jobs.stages) {
			const exitCode = await this.runStage(run, stage, workdir, hashedId);
			if (exitCode !== 0) {
				logger.error(
					`Stage ${stage.name} (${stage.id}) failed with exit code: ${exitCode}`,
				);
				return exitCode;
			}
		}
		return 0;
	}

	private async runStage(
		run: Run,
		stage: Stage,
		workdir: string,
		hashedId: bigint | number,
	): Promise<number> {
		const image = stage.image || "debian:latest";
		const env = Array.isArray(run.workflow.environment)
			? run.workflow.environment.map(
					(e: any) => `${e.key}=${e.value}`,
			  )
			: [];
		await this.ensureImageExists(image);

		for (const step of stage.steps) {
			const context: JobContext = {
				workflowId: run.workflow.id,
				jobId: stage.id,
				runId: run.id,
			};

			const exitCode = await this.runStep(
				context,
				step,
				image,
				workdir,
				hashedId,
				env
			);
			if (exitCode !== 0) {
				return exitCode;
			}
		}

		return 0;
	}

	private async runStep(
		context: JobContext,
		step: Step,
		image: string,
		workdir: string,
		hashedId: bigint | number,
		envirionment: string[]
	): Promise<number> {
		const jobLogger = new BatchLogger(
			context,
			this.token,
			this.server,
			10,
			1000,
		);

		if (!step.data?.config || !(step.data.config as any)?.cmd) {
			return 0;
		}

		const stdout = new PassThrough();
		const stderr = new PassThrough();

		this.pipeToLogger(stdout, "info", jobLogger);
		this.pipeToLogger(stderr, "error", jobLogger);
		logger.info((step.data.config as any)?.cmd);

		const exitCode = await new Promise<number>((resolve, reject) => {
			this.docker.createContainer(
				{
					Image: image,
					Cmd: (step.data.config as any)?.cmd,
					name: `mincy_${hashedId}_${step.id}`,
					WorkingDir: "/workspace",
					HostConfig: {
						Binds: [`${workdir}:/workspace`],
					},
					Env: envirionment,
				},
				(err, container) => {
					if (err || !container) {
						return reject(err ?? new Error("Container creation failed"));
					}

					container.attach(
						{ stream: true, stdout: true, stderr: true },
						(err, stream) => {
							if (err || !stream) {
								return reject(
									err ?? new Error("Failed to attach to container"),
								);
							}
							container.modem.demuxStream(stream, stdout, stderr);
						},
					);

					container
						.start()
						.then(() => container.wait())
						.then((result) =>
							container.remove().then(() => resolve(result.StatusCode)),
						)
						.catch(reject);
				},
			);
		});

		await jobLogger.flush();
		return exitCode;
	}

	private pipeToLogger(
		stream: PassThrough,
		level: "info" | "error",
		jobLogger: BatchLogger,
	): void {
		stream.on("data", (chunk: Buffer) => {
			const line = chunk.toString().trim();
			if (line) {
				jobLogger.log(level, line);
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
