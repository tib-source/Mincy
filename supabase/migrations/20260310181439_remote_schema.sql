create type "public"."AgentStatus" as enum ('active', 'paused', 'stopped');

alter table "public"."Agents" add column "last_heartbeat" timestamp with time zone;

alter table "public"."Agents" add column "status" public."AgentStatus";

alter table "public"."Agents" add column "token_hash" text;


