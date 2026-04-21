-- Private storage bucket for project caches.
-- Unlike artifacts (run-scoped, append-only), caches are project-scoped and
-- upserted by user-chosen keys — the whole point is reuse across runs.

INSERT INTO storage.buckets (id, name, public)
VALUES ('caches', 'caches', false)
ON CONFLICT (id) DO NOTHING;

-- Agents write/read via the service role; authenticated users can also read
-- (e.g. a future UI to list/clear caches per project).
CREATE POLICY "Authenticated users can read cache objects"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'caches');

-- Lets a project owner clear caches via the UI without a dedicated API route.
CREATE POLICY "Authenticated users can delete cache objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'caches');
