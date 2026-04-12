import { NextRequest, NextResponse } from "next/server";
import { App } from "octokit";

const privateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
const appId = process.env.GITHUB_APP_ID || "";

const app = new App({
    appId: Number.parseInt(appId, 10),
    privateKey,
    webhooks: { secret },
});


export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-hub-signature-256") || "";
    const id = request.headers.get("x-github-delivery") || ""
    const event = request.headers.get("x-github-event") || "";

    console.log("Received GitHub webhook:", { event, request });
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
