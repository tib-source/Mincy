import Agent from "./src/agent/baseAgent"
import { AgentConfig } from "./src/config"
import { loadTomlConfig } from "./src/util"


const AGENT_CONFIG_DIR = Bun.env.MINCY_AGENT_CONFIG
const rawConfig = await loadTomlConfig(AGENT_CONFIG_DIR!)
const config = AgentConfig.safeParse(rawConfig)
console.log(config)


const testAgent = new Agent("testing", "TestAgent", 5)

testAgent.register()

process.on("SIGINT", ()=> {
    console.log("Stopping agent")
    testAgent.stop();
    process.exit()
})