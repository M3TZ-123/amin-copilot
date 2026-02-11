import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalUsers, getActiveSubscriptionCount } from "@/lib/queries/users";
import { getTotalRevenue, getRevenueByMonth } from "@/lib/queries/payments";
import { getTotalCreditsDistributed } from "@/lib/queries/credits";
import { db } from "@/lib/db";
import { formatDate, formatTND } from "@/lib/utils";
import { RevenueChart } from "./revenue-chart";

export default async function AdminOverviewPage() {
  const [totalUsers, activeSubscriptions, totalRevenue, totalCredits, revenueByMonth, recentUsers] =
    await Promise.all([
      getTotalUsers(),
      getActiveSubscriptionCount(),
      getTotalRevenue(),
      getTotalCreditsDistributed(),
      getRevenueByMonth(),
      db.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Overview</h1>
        <p className="text-slate-400 mt-1">
          Manage subscriptions and monitor your business
        </p>
      </div>

      <AnalyticsCards
        totalUsers={totalUsers}
        activeSubscriptions={activeSubscriptions}
        totalRevenue={totalRevenue}
        totalCredits={totalCredits}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length === 0 ? (
              <p className="text-sm text-slate-500">No revenue data yet.</p>
            ) : (
              <RevenueChart data={revenueByMonth} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Recently Added Users</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-500">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
