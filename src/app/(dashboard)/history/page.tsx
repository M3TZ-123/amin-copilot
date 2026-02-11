import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/queries/users";
import { getCreditHistory } from "@/lib/queries/credits";
import { getPaymentsByUser } from "@/lib/queries/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, formatTND } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default async function HistoryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect("/dashboard");

  const [creditHistory, payments] = await Promise.all([
    getCreditHistory(user.id),
    getPaymentsByUser(user.id),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">History</h1>
        <p className="text-slate-400 mt-1">
          Full credit and payment history
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Month</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Paid On</TableHead>
                    <TableHead className="text-slate-400">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-800">
                      <TableCell className="text-slate-200 font-medium">
                        {payment.month}
                      </TableCell>
                      <TableCell className="text-emerald-400 font-semibold">
                        {formatTND(payment.amountTnd.toString())}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {formatDate(payment.paidAt)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {payment.note || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Credit Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {creditHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No credit activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Change</TableHead>
                    <TableHead className="text-slate-400">Note</TableHead>
                    <TableHead className="text-slate-400">By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditHistory.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-800">
                      <TableCell className="text-slate-400">
                        {formatDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          {entry.delta > 0 ? (
                            <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownCircle className="h-3.5 w-3.5 text-red-400" />
                          )}
                          <span
                            className={`font-semibold ${
                              entry.delta > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {entry.delta > 0 ? "+" : ""}
                            {entry.delta}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {entry.note || "—"}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {entry.admin.fullName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
