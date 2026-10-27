export type DashboardStats = {
  totalUsers: number;
  openReports: number;
  pendingVerifications: number;
  sitterRequests: number;
};

const mockDashboardStats: DashboardStats = {
  totalUsers: 2486,
  openReports: 4,
  pendingVerifications: 6,
  sitterRequests: 18,
};

/**
 * Dashboard numbers for the admin home page.
 * Replace the mock return with a database query when Prisma is ready.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return mockDashboardStats;
}
