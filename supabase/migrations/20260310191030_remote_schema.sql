set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.claim_next_job(p_agent_id uuid)
 RETURNS SETOF public."PipelineRun"
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM public.pipeline_runs
    WHERE agent_id IS NULL
      AND status = 'pending'
    ORDER BY created_at NULLS LAST, id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  ),
  updated AS (
    UPDATE public.pipeline_runs pr
    SET agent_id = p_agent_id,
        status = 'queued'
    FROM candidates c
    WHERE pr.id = c.id
    RETURNING pr.*
  )
  SELECT * FROM updated;
END;
$function$
;


