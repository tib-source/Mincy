-- Null out orphaned user_ids that don't exist in profile
UPDATE "public"."audit_log"
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM "public"."profile");

-- Add FK from audit_log to profile so Supabase can resolve the join
ALTER TABLE "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_profile_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL;
