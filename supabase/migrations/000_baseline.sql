-- Initial schema migration with UUID for Projects

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';
SET default_table_access_method = "heap";

-- Create enums
CREATE TYPE "public"."PipelineStatus" AS ENUM (
    'queued',
    'running',
    'passed',
    'failed'
);

ALTER TYPE "public"."PipelineStatus" OWNER TO "postgres";

CREATE TYPE "public"."TriggerType" AS ENUM (
    'manual',
    'cron',
    'push'
);

ALTER TYPE "public"."TriggerType" OWNER TO "postgres";

-- Create tables
CREATE TABLE "public"."Agents" (
    "id" uuid DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text",
    "type" "text",
    "capacity" bigint
);

ALTER TABLE "public"."Agents" OWNER TO "postgres";

CREATE TABLE "public"."Logs" (
    "id" uuid DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_id" uuid,
    "workflow_id" uuid NOT NULL
);

ALTER TABLE "public"."Logs" OWNER TO "postgres";

CREATE TABLE "public"."PipelineRun" (
    "id" uuid DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project_id" uuid,
    "workflow_id" uuid,
    "logs" uuid,
    "status" "public"."PipelineStatus" NOT NULL,
    "commit_sha" "text",
    "branch" "text",
    "finished_at" timestamp with time zone,
    "triggered_by" "public"."TriggerType",
    "agent_id" uuid
);

ALTER TABLE "public"."PipelineRun" OWNER TO "postgres";


CREATE TABLE "public"."Projects" (
    "id" uuid DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org" "text" DEFAULT ''::"text" NOT NULL,
    "provider" "text" NOT NULL,
    "cloneUrl" "text" NOT NULL,
    "user_id" "uuid"
);

ALTER TABLE "public"."Projects" OWNER TO "postgres";

CREATE TABLE "public"."Workflow" (
    "id" uuid DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "projectId" uuid,
    "environment" "jsonb",
    "jobs" "jsonb",
    "pipeline" "jsonb"
);

ALTER TABLE "public"."Workflow" OWNER TO "postgres";

-- Add primary keys
ALTER TABLE ONLY "public"."Agents"
    ADD CONSTRAINT "Agents_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Logs"
    ADD CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."PipelineRun"
    ADD CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Workflow"
    ADD CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id");

-- Add foreign keys
ALTER TABLE ONLY "public"."Logs"
    ADD CONSTRAINT "Jobs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."Workflow"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."PipelineRun"
    ADD CONSTRAINT "PipelineRun_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."Agents"("id");

ALTER TABLE ONLY "public"."PipelineRun"
    ADD CONSTRAINT "PipelineRun_logs_fkey" FOREIGN KEY ("logs") REFERENCES "public"."Logs"("id");

ALTER TABLE ONLY "public"."PipelineRun"
    ADD CONSTRAINT "PipelineRun_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Projects"("id");

ALTER TABLE ONLY "public"."PipelineRun"
    ADD CONSTRAINT "PipelineRun_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."Workflow"("id");

ALTER TABLE ONLY "public"."Projects"
    ADD CONSTRAINT "Projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Workflow"
    ADD CONSTRAINT "Workflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id");

-- Enable RLS
ALTER TABLE "public"."Agents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PipelineRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Workflow" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow logged-in GitHub users to select" ON "public"."Projects" FOR SELECT USING (("auth"."uid"() IS NOT NULL));
CREATE POLICY "Allow logged-in users to insert projects" ON "public"."Projects" FOR INSERT TO "authenticated", "service_role" WITH CHECK (("auth"."uid"() IS NOT NULL));

-- Realtime publication
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

-- Schema grants
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Table grants
GRANT ALL ON TABLE "public"."Agents" TO "anon";
GRANT ALL ON TABLE "public"."Agents" TO "authenticated";
GRANT ALL ON TABLE "public"."Agents" TO "service_role";

GRANT ALL ON TABLE "public"."Logs" TO "anon";
GRANT ALL ON TABLE "public"."Logs" TO "authenticated";
GRANT ALL ON TABLE "public"."Logs" TO "service_role";

GRANT ALL ON TABLE "public"."PipelineRun" TO "anon";
GRANT ALL ON TABLE "public"."PipelineRun" TO "authenticated";
GRANT ALL ON TABLE "public"."PipelineRun" TO "service_role";

GRANT ALL ON TABLE "public"."Projects" TO "anon";
GRANT ALL ON TABLE "public"."Projects" TO "authenticated";
GRANT ALL ON TABLE "public"."Projects" TO "service_role";

GRANT ALL ON TABLE "public"."Workflow" TO "anon";
GRANT ALL ON TABLE "public"."Workflow" TO "authenticated";
GRANT ALL ON TABLE "public"."Workflow" TO "service_role";

-- Default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
