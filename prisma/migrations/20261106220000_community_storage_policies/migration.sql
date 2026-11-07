-- Each authenticated member can manage photos only in their own user-ID folder.
-- Public image URLs are already readable through the public bucket.
CREATE POLICY "Members upload own community photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'community-posts'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Members inspect own community photos" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'community-posts'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Members remove own community photos" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'community-posts'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
