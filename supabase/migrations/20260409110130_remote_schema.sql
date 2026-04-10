create extension if not exists "pg_net" with schema "extensions";

alter type "public"."PipelineStatus" rename to "PipelineStatus__old_version_to_be_dropped";

create type "public"."PipelineStatus" as enum ('queued', 'running', 'passed', 'failed', 'pending');

alter table "public"."PipelineRun" alter column status type "public"."PipelineStatus" using status::text::"public"."PipelineStatus";

drop type "public"."PipelineStatus__old_version_to_be_dropped";

alter table "public"."Agents" add column "user_id" uuid;

alter table "public"."Agents" add constraint "Agents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Agents" validate constraint "Agents_user_id_fkey";

alter table "public"."Logs" add constraint "Logs_run_id_fkey" FOREIGN KEY (run_id) REFERENCES public."PipelineRun"(id) not valid;

alter table "public"."Logs" validate constraint "Logs_run_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.claim_next_job(p_agent_id uuid)
 RETURNS SETOF public."PipelineRun"
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM public."PipelineRun"
    WHERE agent_id IS NULL
      AND status = 'pending'
    ORDER BY created_at NULLS LAST, id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  ),
  updated AS (
    UPDATE public."PipelineRun" pr
    SET agent_id = p_agent_id,
        status = 'queued'
    FROM candidates c
    WHERE pr.id = c.id
    RETURNING pr.*
  )
  SELECT * FROM updated;
END;$function$
;


  create policy "Enable delete for users based on user_id"
  on "public"."Agents"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."Agents"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable users to view their own data only"
  on "public"."Agents"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));
