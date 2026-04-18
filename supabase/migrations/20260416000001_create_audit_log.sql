-- Audit log table and trigger function

CREATE TABLE "public"."audit_log" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid DEFAULT auth.uid(),
    "action" text NOT NULL,          -- INSERT, UPDATE, DELETE
    "table_name" text NOT NULL,
    "record_id" text,
    "old_data" jsonb,
    "new_data" jsonb,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_profile_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL;

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON "public"."audit_log" FOR SELECT
    USING (auth.uid() = user_id);

-- Allow inserts from triggers (they run as the invoking user)
CREATE POLICY "Allow trigger inserts"
    ON "public"."audit_log" FOR INSERT
    WITH CHECK (true);

GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";

-- Generic trigger function that works for any table
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (action, table_name, record_id, new_data)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (action, table_name, record_id, old_data, new_data)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (action, table_name, record_id, old_data)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to main tables
CREATE TRIGGER audit_projects
    AFTER INSERT OR UPDATE OR DELETE ON "public"."Projects"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_workflow
    AFTER INSERT OR UPDATE OR DELETE ON "public"."Workflow"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_pipeline_run
    AFTER INSERT OR UPDATE OR DELETE ON "public"."PipelineRun"
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
