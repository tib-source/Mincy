export const simpleWorkflow = {
	id: 1,
	project_id: 1,
	created_at: "2025-10-19T10:30:00.000Z",
	environment: {},
	jobs: [
		{
			name: "hello-world",
			image: "ubuntu",
			cmd: ["sh", "-c", "echo Hello world! && cd / && env && ls -la"],
			logs: [],
			status: "pending",
		},
		{
			name: "hello-world",
			image: "alpine:latest",
			cmd: ["ls", "-la"],
			logs: [],
			status: "pending",
		},
	],
};



// const AGENT_CONFIG_DIR = Bun.env.MINCY_AGENT_CONFIG;
// const rawConfig = await loadTomlConfig(AGENT_CONFIG_DIR!);
// const config = AgentConfig.safeParse(rawConfig);
// console.log(config);

// const testAgent = new DockerAgent("testing", "TestAgent", 5, tmpdir());

// testAgent.execute(simpleWorkflow);

// process.on("SIGINT", () => {
// 	console.log("Stopping agent");
// 	testAgent.stop();
// 	process.exit();
// });
