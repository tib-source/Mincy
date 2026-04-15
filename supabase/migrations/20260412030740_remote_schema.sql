drop policy "Service role can manage secrets" on "public"."secrets";

drop policy "Users can view own secrets" on "public"."secrets";

revoke delete on table "public"."secrets" from "anon";

revoke insert on table "public"."secrets" from "anon";

revoke references on table "public"."secrets" from "anon";

revoke select on table "public"."secrets" from "anon";

revoke trigger on table "public"."secrets" from "anon";

revoke truncate on table "public"."secrets" from "anon";

revoke update on table "public"."secrets" from "anon";

revoke delete on table "public"."secrets" from "authenticated";

revoke insert on table "public"."secrets" from "authenticated";

revoke references on table "public"."secrets" from "authenticated";

revoke select on table "public"."secrets" from "authenticated";

revoke trigger on table "public"."secrets" from "authenticated";

revoke truncate on table "public"."secrets" from "authenticated";

revoke update on table "public"."secrets" from "authenticated";

revoke delete on table "public"."secrets" from "service_role";

revoke insert on table "public"."secrets" from "service_role";

revoke references on table "public"."secrets" from "service_role";

revoke select on table "public"."secrets" from "service_role";

revoke trigger on table "public"."secrets" from "service_role";

revoke truncate on table "public"."secrets" from "service_role";

revoke update on table "public"."secrets" from "service_role";

alter table "public"."PipelineRun" drop constraint "PipelineRun_logs_fkey";

alter table "public"."secrets" drop constraint "secrets_user_id_fkey";

alter table "public"."secrets" drop constraint "secrets_user_id_name_key";

alter table "public"."secrets" drop constraint "secrets_pkey";

drop index if exists "public"."secrets_pkey";

drop index if exists "public"."secrets_user_id_name_key";

drop table "public"."secrets";

alter type "public"."TriggerType" rename to "TriggerType__old_version_to_be_dropped";

create type "public"."TriggerType" as enum ('manual', 'cron', 'commit', 'pull_request', 'tag');

alter table "public"."PipelineRun" alter column triggered_by type "public"."TriggerType" using triggered_by::text::"public"."TriggerType";

drop type "public"."TriggerType__old_version_to_be_dropped";

alter table "public"."Logs" alter column "job_id" set data type text using "job_id"::text;

alter table "public"."Logs" disable row level security;

alter table "public"."PipelineRun" drop column "branch";

alter table "public"."PipelineRun" drop column "commit_sha";

alter table "public"."PipelineRun" drop column "logs";

alter table "public"."PipelineRun" add column "trigger_context" jsonb;

alter table "public"."PipelineRun" disable row level security;

alter table "public"."profile" add column "github_provider_refresh_token" character varying;

alter table "public"."profile" add column "github_provider_token" character varying;

