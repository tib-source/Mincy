drop trigger if exists "graph-to-dag" on "public"."Workflow";

CREATE TRIGGER "graph-to-dag" AFTER INSERT OR UPDATE ON public."Workflow" FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://xguaudrvdjmxteufzxvt.supabase.co/functions/v1/graph-to-dag', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


