import { validateAgentToken } from "@/utils/agents/validateAgentToken";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest){
    const agent = await validateAgentToken(request)
    
    if (!agent){
        return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 404 },
        );}
    
    const supabase = await createClient()
    const { data, error } = await supabase.rpc(
        'claim_next_job', {
            p_agent_id : agent.id
        }
    )

    console.log(data, error)

    if (error){
        console.error(error)
        return NextResponse.json({
            error
        }, {status: 400})
    }

    return NextResponse.json({data}, { status: 201})
}