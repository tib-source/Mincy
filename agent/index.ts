import { tmpdir } from "node:os"
import Agent from "./src/agent/baseAgent"
import { AgentConfig } from "./src/config"
import { loadTomlConfig } from "./src/util"
import DockerAgent from "./src/agent/DockerAgent"
import { simpleWorkflow } from "./test/test"


const AGENT_CONFIG_DIR = Bun.env.MINCY_AGENT_CONFIG
const rawConfig = await loadTomlConfig(AGENT_CONFIG_DIR!)
const config = AgentConfig.safeParse(rawConfig)
console.log(config)


const testAgent = new DockerAgent("testing", "TestAgent", 5, tmpdir())

testAgent.execute(simpleWorkflow)

process.on("SIGINT", ()=> {
    console.log("Stopping agent")
    testAgent.stop();
    process.exit()
})