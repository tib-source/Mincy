import { Hono } from "hono";
import { getSupabase } from "../middleware/auth.middleware";

const agents = new Hono();

agents.get("/", async (c) => {
	const supabase = getSupabase(c);
	const user = supabase.auth.getUser();

	const { data } = await supabase.from("Projects").select("*");
	return c.json({ data, user });
});
agents.get("/register", (c) => c.json("You have been registered"));
agents.get("/heartbeat", (c) => c.json("You have been marked healthy!"));

export default agents;
