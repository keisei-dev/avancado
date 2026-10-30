// Placeholder photos copied from the UI prototype (Unsplash hot-links).
// Replace them with our own images in Supabase Storage before launch.
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const photos = {
  dog1: unsplash("photo-1552053831-71594a27632d", 900),
  dog2: unsplash("photo-1558788353-f76d92427f16", 900),
  dog3: unsplash("photo-1548199973-03cce0bbc87b", 900),
  dog4: unsplash("photo-1583511655857-d19b40a7a54e", 900),
  dog5: unsplash("photo-1561037404-61cd46aa615b", 900),
  cat1: unsplash("photo-1573865526739-10659fec78a5", 900),
  cat2: unsplash("photo-1574158622682-e40e69881006", 900),
  cat3: unsplash("photo-1592194996308-7b43878e84a6", 900),
  spot1: unsplash("photo-1530281700549-e82e7bf110d6", 900),
  spot2: unsplash("photo-1554118811-1e0d58224f24", 900),
  spot3: unsplash("photo-1629909613654-28e377c37b09", 900),
  avatar1: unsplash("photo-1494790108377-be9c29b29330", 300),
  avatar2: unsplash("photo-1500648767791-00dcc994a43e", 300),
  avatar3: unsplash("photo-1438761681033-6461ffad8d80", 300),
  avatar4: unsplash("photo-1506794778202-cad84cf45f1d", 300),
  avatar5: unsplash("photo-1544005313-94ddf0286df2", 300),
  avatar6: unsplash("photo-1507003211169-0a1dd7228f2d", 300),
  spot4: unsplash("photo-1509042239860-f550ce710b93", 900),
  spot5: unsplash("photo-1515003197210-e0cd71810b5f", 900),
  spot6: unsplash("photo-1566073771259-6a8506099945", 900),
  spot7: unsplash("photo-1551632811-561732d1e306", 900),
};
