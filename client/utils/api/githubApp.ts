import { App } from "octokit";

export const githubApp = new App({
	appId: Number.parseInt(process.env.GITHUB_APP_ID || "", 10),
	privateKey: process.env.GITHUB_APP_PRIVATE_KEY || "",
	webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET || "" },
});
