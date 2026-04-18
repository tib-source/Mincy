-- Drop the profile FK — not all users have profile rows when triggers fire
ALTER TABLE "public"."audit_log"
    DROP CONSTRAINT IF EXISTS "audit_log_user_id_profile_fkey";
