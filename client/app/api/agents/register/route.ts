import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    const agent = await validateAgentToken(request)
    if (!agent){
		return NextResponse.json(
			{ message: "Invalid credentials" },
			{ status: 404 },
		);}
    const supabase = await createClient()

    await supabase.from("Agents").update({
        status: "active",
        last_heartbeat: new Date().toISOString(),
    }).eq("id", agent.id)

    return NextResponse.json({}, { status: 201})
}