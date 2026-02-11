import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/queries/users";
import { getCreditBalance, getCreditHistory } from "@/lib/queries/credits";
import { getPaymentsByUser } from "@/lib/queries/payments";
import { CreditCard } from "@/components/dashboard/CreditCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTND } from "@/lib/utils";
import { CalendarDays, CreditCard as CreditCardIcon } from "lucide-react";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");

  const user = await getUserByClerkId(clerkId);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-semibold text-slate-200">Account Setup</h2>
        <p className="text-slate-400">
          Your account is being set up. Please contact your administrator.
        </p>
      </div>
    );
  }

  const [creditBalance, recentCredits, recentPayments] = await Promise.all([
    getCreditBalance(user.id),
    getCreditHistory(user.id, 5),
    getPaymentsByUser(user.id, 3),
  ]);

  const subscription = user.subscriptions[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s your subscription overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreditCard balance={creditBalance} />

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              {subscription ? (
                <StatusBadge status={subscription.status} />
              ) : (
                <span className="text-slate-500 text-sm">No subscription</span>
              )}
            </div>
            {subscription?.expiresAt && (
              <p className="text-xs text-slate-500 mt-3">
                Valid until {formatDate(subscription.expiresAt)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Member Since
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-slate-200">
              {formatDate(user.createdAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed entries={recentCredits} />

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {payment.month}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(payment.paidAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatTND(payment.amountTnd.toString())}
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
