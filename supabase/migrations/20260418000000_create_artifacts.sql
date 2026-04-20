-- Artifacts produced by pipeline runs.
-- Binary content lives in the `artifacts` storage bucket;
-- this table is the queryable index (size, sha, name, run/step provenance).

CREATE TABLE "public"."Artifacts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "run_id" uuid NOT NULL REFERENCES "public"."PipelineRun"("id") ON DELETE CASCADE,
    "step_id" text,
    "name" text NOT NULL,
    "storage_key" text NOT NULL UNIQUE,
    "size_bytes" bigint NOT NULL,
    "sha256" text,
    "content_type" text,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_artifacts_run_id ON "public"."Artifacts"(run_id);
CREATE INDEX idx_artifacts_created_at ON "public"."Artifacts"(created_at DESC);

ALTER TABLE "public"."Artifacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow logged-in users to select artifacts"
    ON "public"."Artifacts" FOR SELECT
    USING (auth.uid() IS NOT NULL);

GRANT ALL ON TABLE "public"."Artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."Artifacts" TO "service_role";