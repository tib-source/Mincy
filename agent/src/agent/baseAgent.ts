import type { Tables } from "@mincy/shared";
import pino from "pino";
import { logger } from "../..";

class Agent {
	id: string;
	name: string;
	capacity: number;
	token: string;
	server: string = "localhost:3000";
	pollInterval: number = 3000;
	heartbeatId: NodeJS.Timeout | null = null;
	jobPollId: NodeJS.Timeout | null = null;

	workdir: string;

	constructor(id: string, name: string, capacity: number, workdir: string, token: string) {
		this.id = id;
		this.name = name;
		this.capacity = capacity;
		this.workdir = workdir;
		this.token = token
	}

	async register() {
		const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/register`, {
			method: "POST",
		});
		if (!res.ok) {
			throw Error("Agent failed to register");
		}
		if (res.ok)
			logger.info("Agent registered successfully")
			this.startHeartBeat();
			this.startJobPoll();
	}

	execute(workflow: Tables<"Workflow">) {
		throw Error(
			"This is the base agent, something must've gone really bad to get here",
		);
	}

	async heartbeat() {
		const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/heartbeat`);
		if (!res.ok) {
			console.log("Warning: failed to send heart beat");
		}
		logger.info("Heartbeat successfully sent")
	}

	startHeartBeat() {
		if (this.heartbeatId) return;
		this.heartbeatId = setInterval(() => this.heartbeat(), this.pollInterval);
	}

	startJobPoll(){
		if (this.jobPollId) return;
		this.jobPollId = setInterval(() => {
			this.findJob()
		}, this.pollInterval);
	}
	
	stop() {
		if (this.heartbeatId) {
			clearInterval(this.heartbeatId);
			this.heartbeatId = null;
		}
	}

	async findJob(){
		if (this.jobPollId){
			const res = await this.sendAuthenticatedRequest(`${this.server}/api/agents/job`);
			if (!res.ok) {
				logger.info("No jobs available");
				logger.error(res.text)

			}else{
				logger.info("Job aquired")
				logger.info(await res.json())

			}
		}
	}

	sendAuthenticatedRequest(url: string, request?: RequestInit){
		return fetch(url, {
			...request,
			headers: {
				"authorization": `Bearer ${this.token}`
			},
		})
	}
}

export default Agent;
