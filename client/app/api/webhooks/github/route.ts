import { createRun } from "@/actions/runs";
import { getProjectWithWorkflowByRepo } from "@/actions/projects";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { App } from "octokit";

const privateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
const appId = process.env.GITHUB_APP_ID || "";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_PRIVATE_KEY!,
);


const app = new App({
    appId: Number.parseInt(appId, 10),
    privateKey,
    webhooks: { secret },
});

app.webhooks.on("push", async ({ payload }) => {
    console.log("Received push event for repository:", payload.repository.name, "Organization:", payload.repository.owner?.login);

  const result = await getProjectWithWorkflowByRepo(supabase, payload.repository.owner?.login ?? "", payload.repository.name);
  if (!result) {return;}

  const { project, workflow } = result;

  const triggers = workflow.jobs?.triggers ?? [];
  console.log("Checking for triggers : ", triggers);

  if (payload.ref.startsWith("refs/tags/")) {
    const tagTrigger = triggers.find((t: any) => t.type === "tag" && t.enabled);
    if (!tagTrigger) {return};

    await createRun(supabase, project.id, workflow.id, "tag", {
      ref: payload.ref,
      sha: payload.after,
      tag: payload.ref.replace("refs/tags/", ""),
      sender: payload.sender?.login,
      url: payload.repository.html_url,
    });
    return;
  }

  const branch = payload.ref.replace("refs/heads/", "");
  const commitTrigger = triggers.find(
    (t: any) =>
      t.type === "commit" &&
      t.enabled &&
      t.branches?.some((pattern: string) =>
        new RegExp(`^${pattern.replace(/\*/g, ".*")}$`).test(branch),
      ),
  );
  if (!commitTrigger) {return};
  await createRun(supabase, project.id, workflow.id, "commit", {
    ref: payload.ref,
    branch,
    sha: payload.after,
    message: payload.head_commit?.message,
    sender: payload.sender?.login,
    url: payload.repository.html_url,
  });
});

// inspired by the octokit docs: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-hub-signature-256") || "";
    const id = request.headers.get("x-github-delivery") || ""
    const event = request.headers.get("x-github-event") || "";

    if (!signature || !id || !event ) {
        return NextResponse.json({ message: "Missing required headers" }, { status: 400 });
    }


    const payload = await request.text();


    try {
        await app.webhooks.verifyAndReceive({
            id,
            name: event,
            payload,
            signature
        });
    } catch (error) {
        console.error("Error verifying webhook:", error);
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}



export const runtime = "nodejs";
