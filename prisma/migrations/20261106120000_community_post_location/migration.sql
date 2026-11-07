ALTER TABLE "CommunityPost" ADD COLUMN "location" TEXT;

-- Public bucket for community post photos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-posts', 'community-posts', true, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
