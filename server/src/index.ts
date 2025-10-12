import { Hono } from 'hono'
import agents from './routes/agent'
import { supabaseMiddleware } from './middleware/auth.middleware'

const app = new Hono().basePath("/api")

app.use(supabaseMiddleware())
app.route('agents/',agents) 
app.get("*", c => c.notFound())



export default {
  port: 3001, 
  fetch: app.fetch
}
