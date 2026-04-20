import { mkdir } from "node:fs/promises";
import { PassThrough } from "node:stream";
import Docker from "dockerode";
import { logger } from "../..";
import { BaseExecutor, type JobContext } from "./executor";
import { BatchLogger } from "../logger/logger";
import type { Run, Stage, Step, NodeManifest } from "@mincy/shared";

export default class DockerExecutor extends BaseExecutor {
	workdir: string;
	private readonly docker: Docker;

	constructor(
		workdir: string,
		server: string,
		token: string,
		nodesDir: string,
		manifests: NodeManifest[],
	) {
		super(server, token, nodesDir, manifests);
		this.workdir = workdir;
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
		const stageEnv = Array.isArray(run.workflow.environment)
			? run.workflow.environment.map((e: any) => `${e.key}=${e.value}`)
			: [];
		await this.ensureImageExists(image);

		// Create one long-lived container for the entire stage
		const container = await this.docker.createContainer({
			Image: image,
			Cmd: ["tail", "-f", "/dev/null"],
			name: `mincy_${hashedId}_${stage.id}`,
			WorkingDir: "/workspace",
			HostConfig: {
				Binds: [
					`${workdir}:/workspace`,
					`${this.nodesDir}:/mincy/nodes:ro`,
				],
			},
			Env: stageEnv,
		});

		await container.start();
		logger.info(`Started stage container: ${stage.name} (${stage.id})`);

		try {
			for (const step of stage.steps) {
				const context: JobContext = {
					workflowId: run.workflow.id,
					jobId: stage.id,
					runId: run.id,
				};

				const exitCode = await this.execStep(container, context, step, run);
				if (exitCode !== 0) {
					return exitCode;
				}
			}
			return 0;
		} finally {
			await container.stop().catch(() => {});
			await container.remove().catch(() => {});
			logger.info(`Removed stage container: ${stage.name}`);
		}
	}

	private async execStep(
		container: Docker.Container,
		context: JobContext,
		step: Step,
		run: Run,
	): Promise<number> {
		const jobLogger = new BatchLogger(
			context,
			this.token,
			this.server,
			10,
			1000,
		);

		const materialized = await this.materializeStep(step, run);
		if (!materialized) {
			return 0;
		}

		logger.info(materialized.cmd);
		const exec = await container.exec({
			Cmd: materialized.cmd,
			Env: materialized.env,
			AttachStdout: true,
			AttachStderr: true,
			WorkingDir: "/workspace",
		});

		const stream = await exec.start({ Tty: false });

		const stdout = new PassThrough();
		const stderr = new PassThrough();
		this.pipeToLogger(stdout, "info", jobLogger);
		this.pipeToLogger(stderr, "error", jobLogger);
		container.modem.demuxStream(stream, stdout, stderr);

		// Poll exec.inspect() until the process exits
		const exitCode = await new Promise<number>((resolve) => {
			const poll = setInterval(async () => {
				try {
					const info = await exec.inspect();
					if (!info.Running) {
						clearInterval(poll);
						stream.destroy();
						resolve(info.ExitCode ?? 1);
					}
				} catch {
					clearInterval(poll);
					stream.destroy();
					resolve(1);
				}
			}, 500);
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
