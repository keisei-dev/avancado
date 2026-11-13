-- Public bucket for pet profile photos, with the same limits as community-posts
-- (JPG / PNG, max 5 MB). Each member manages files only in their own folder:
-- pet-photos/{userId}/{fileName}
--
-- The block runs only when Supabase Storage exists. Prisma's shadow database
-- has no "storage" schema, so the check keeps this migration safe there.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets not found, skipping pet-photos bucket';
    RETURN;
  END IF;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('pet-photos', 'pet-photos', true, 5242880, ARRAY['image/jpeg', 'image/png'])
  ON CONFLICT (id) DO NOTHING;

  CREATE POLICY "Members upload own pet photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

  CREATE POLICY "Members inspect own pet photos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

  CREATE POLICY "Members remove own pet photos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
END
$$;