import { tmpdir } from "node:os";
import pino from "pino";
import DockerAgent from "./src/agent/DockerAgent";
import { AgentConfig } from "./src/config";
import { loadTomlConfig } from "./src/util";
import { simpleWorkflow } from "./test/test";
import { createHash, randomBytes } from "node:crypto";
import Agent from "./src/agent/baseAgent";
import { exit } from "node:process";

let AGENT_TOKEN = Bun.env.AGENT_TOKEN;

export const logger = pino({
	base: null,
	level: "info",
	transport: {
		target: "pino-pretty",
		options: { colorize: true },
	},
});

if (!AGENT_TOKEN){
	const token = randomBytes(32).toString('hex')
	const hashed = createHash('sha256').update(token).digest('hex')
	AGENT_TOKEN = token
	logger.info(`TOKEN: ${token}, HASHED: ${hashed}`)
	exit(1)
}



const base_agent = new Agent(
	'agent-1',
	'base-agent',
	5,
	'/tmp/workdir',
	AGENT_TOKEN
)

await base_agent.register()
