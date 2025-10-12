import { Hono } from "hono"; 
import { getSupabase } from "../middleware/auth.middleware";

const agents = new Hono()


agents.get("/", async c => {


    let supabase = getSupabase(c)
    let user = supabase.auth.getUser()

    const { data } = await supabase.from("Projects").select("*")
    return c.json({data, user})

})
agents.get("/register", c => c.text("You have been registered"))
agents.get("/heartbeat", c => c.text("You have been marked healthy!"))



export default agents;