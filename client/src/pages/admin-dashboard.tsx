import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, TrendingUp } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalReflections: number;
  totalJournalEntries: number;
  totalWeeklyCompletions: number;
  recentUsers: Array<{
    id: string;
    name: string;
    currentWeek: number;
    completedSuggestions: number;
    createdAt: string;
  }>;
  weeklyProgress: Array<{
    week: number;
    completedUsers: number;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">Failed to load admin data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-4">
      <div className="container mx-auto max-w-6xl" data-testid="admin-dashboard">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🦀 Hermit Cove Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your social anxiety recovery app's usage and user progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-total-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                People on their journey
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-reflections">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reflections</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReflections}</div>
              <p className="text-xs text-muted-foreground">
                Completed challenges
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-journal-entries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJournalEntries}</div>
              <p className="text-xs text-muted-foreground">
                Personal entries
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-completions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weeks Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWeeklyCompletions}</div>
              <p className="text-xs text-muted-foreground">
                Milestone celebrations
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card data-testid="recent-users">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium" data-testid={`user-name-${user.id}`}>{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Week {user.currentWeek} • {user.completedSuggestions}/42 completed
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No users yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card data-testid="weekly-progress">
            <CardHeader>
              <CardTitle>Weekly Completion Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.weeklyProgress.map((week) => (
                  <div key={week.week} className="flex items-center justify-between">
                    <span className="font-medium">Week {week.week}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: stats.totalUsers > 0 ? `${(week.completedUsers / stats.totalUsers) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`week-${week.week}-progress`}>
                        {week.completedUsers}/{stats.totalUsers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Admin Dashboard • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}