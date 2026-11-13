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

const mockDashboardStats: DashboardStats = {
  activeMembers: 2486,
  newMembers: 86,
  reportedPosts: 1,
  reportedSitterEvents: 1,
  petFriendlyPlaces: 6,
  waitingVerification: 1,
  livePosts: 5,
  sitterRequests: 4,
  placeReports: 1,
  metrics: [
    {
      key: "activeMembers",
      label: "Active members",
      value: 2486,
      hint: "+12% this month",
    },
    {
      key: "newMembers",
      label: "New members",
      value: 86,
      hint: "Last 30 days",
    },
    {
      key: "reportedPosts",
      label: "Reported posts",
      value: 1,
      hint: "5 posts live",
    },
    {
      key: "reportedSitterEvents",
      label: "Reported sitter events",
      value: 1,
      hint: "4 requests",
    },
    {
      key: "petFriendlyPlaces",
      label: "Pet-friendly places",
      value: 6,
      hint: "1 place reports",
    },
    {
      key: "waitingVerification",
      label: "Waiting verification",
      value: 1,
      hint: "Identity reviews",
    },
  ],
};

const mockPostingTimes: PostingTimeBucket[] = [
  { label: "6 AM", percent: 28 },
  { label: "9 AM", percent: 41 },
  { label: "12 PM", percent: 66 },
  { label: "3 PM", percent: 92 },
  { label: "6 PM", percent: 78 },
  { label: "9 PM", percent: 56 },
  { label: "12 AM", percent: 35 },
];

const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: "rep-1",
    target: "request",
    subject: "Weekend walks for my gentle senior beagle",
    reason: "Spam",
    date: "Today",
    href: "/admin/sitter-requests?filter=reported",
  },
  {
    id: "rep-2",
    target: "post",
    subject: "Ava Brooks’s post",
    reason: "Inappropriate content",
    date: "Yesterday",
    href: "/admin/community",
  },
  {
    id: "rep-3",
    target: "place",
    subject: "East Van Brewing Co.",
    reason: "No longer pet-friendly",
    date: "Yesterday",
    href: "/admin/spots",
  },
  {
    id: "ver-1",
    target: "verification",
    subject: "Identity verification waiting",
    reason: "User management",
    date: "",
    href: "/admin/users",
  },
];

const mockNavCounts: AdminNavCounts = {
  community: 1,
  requests: 1,
  spots: 1,
  users: 1,
};

/**
 * Dashboard numbers for the admin home page.
 * Replace the mock return with a database query when Prisma is ready.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return mockDashboardStats;
}

export async function getPostingTimes(): Promise<PostingTimeBucket[]> {
  return mockPostingTimes;
}

export async function getReviewQueue(): Promise<ReviewQueueItem[]> {
  return mockReviewQueue.slice(0, 5);
}

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  return mockNavCounts;
}
