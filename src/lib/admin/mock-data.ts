export type DashboardMetricKey =
  | "activeMembers"
  | "newMembers"
  | "reportedPosts"
  | "reportedSitterEvents"
  | "petFriendlyPlaces"
  | "waitingVerification";

export type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  value: number;
  hint: string;
};

export type DashboardStats = {
  activeMembers: number;
  newMembers: number;
  reportedPosts: number;
  reportedSitterEvents: number;
  petFriendlyPlaces: number;
  waitingVerification: number;
  livePosts: number;
  sitterRequests: number;
  placeReports: number;
  metrics: DashboardMetric[];
};

export type PostingTimeBucket = {
  label: string;
  percent: number;
  count: number;
};

export type ReviewTarget = "post" | "request" | "place" | "verification";

export type ReviewQueueItem = {
  id: string;
  target: ReviewTarget;
  subject: string;
  reason: string;
  date: string;
  href: string;
};

export type AdminNavCounts = {
  community: number;
  requests: number;
  spots: number;
  users: number;
};
