
import { Hono } from "hono";

const jobs = new Hono();

jobs.get("/", c => c.json({}))
jobs.post("/create", c => c.json({}))

export default jobs;