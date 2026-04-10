import pino from "pino";
import { createHash, randomBytes } from "node:crypto";
import Agent from "./src/agent/baseAgent";
import { exit } from "node:process";
import DockerExecutor from "./src/executors/dockerExecutor";

let AGENT_TOKEN = Bun.env.AGENT_TOKEN;
const SERVER_URL = Bun.env.SERVER_URL || "http://localhost:3000";

export const logger = pino({
	base: null,
	level: "info",
	transport: {
		target: "pino-pretty",
		options: { colorize: true },
	},
});

if (!AGENT_TOKEN) {
	const token = randomBytes(32).toString("hex");
	const hashed = createHash("sha256").update(token).digest("hex");
	AGENT_TOKEN = token;
	logger.info(`TOKEN: ${token}, HASHED: ${hashed}`);
	exit(1);
}

const workDir = "/tmp/workdir";
const docker = new DockerExecutor(workDir, SERVER_URL, AGENT_TOKEN);

const base_agent = new Agent(
	"agent-1",
	"base-agent",
	5,
	workDir,
	AGENT_TOKEN,
	docker,
	SERVER_URL,
);

await base_agent.register();
