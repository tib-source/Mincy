alter table "public"."audit_log" drop constraint "audit_log_user_id_profile_fkey";

alter table "public"."audit_log" add constraint "audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_log" validate constraint "audit_log_user_id_fkey";


