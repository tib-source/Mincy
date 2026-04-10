alter table "public"."Logs" add column "level" text;
alter table "public"."Logs" add column "timestamp" timestamptz default now();
alter table "public"."Logs" add column "message" text;
alter table "public"."Logs" add column "run_id" uuid;
