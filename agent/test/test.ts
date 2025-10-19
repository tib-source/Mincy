import DockerAgent from "../src/agent/DockerAgent";

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
            status: "pending"
        },
            {
            name: "hello-world",
            image: "alpine:latest",
            cmd: ["ls", "-la"],
            logs: [],
            status: "pending"
        }
    ]
};

