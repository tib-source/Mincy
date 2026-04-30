import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import Agent from "./src/agent/baseAgent";
import { exit } from "node:process";
import DockerExecutor from "./src/executors/dockerExecutor";
import { loadManifests } from "@mincy/shared";
import { logger } from "./src/logger/pino";

let AGENT_TOKEN = Bun.env.AGENT_TOKEN;
const SERVER_URL = Bun.env.SERVER_URL || "http://localhost:3000";

if (!AGENT_TOKEN) {
	const token = randomBytes(32).toString("hex");
	const hashed = createHash("sha256").update(token).digest("hex");
	AGENT_TOKEN = token;
	logger.info(`TOKEN: ${token}, HASHED: ${hashed}`);
	exit(1);
}

const workDir = "/tmp/workdir";
const NODES_DIR = path.resolve(import.meta.dir, "../nodes");
const manifests = loadManifests(NODES_DIR);
logger.info(`Loaded ${manifests.length} node manifest(s): ${manifests.map((m) => m.type).join(", ")}`);
const docker = new DockerExecutor(workDir, SERVER_URL, AGENT_TOKEN, NODES_DIR, manifests);

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
