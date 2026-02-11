"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CreditCard } from "@/components/dashboard/CreditCard";
import { CreditAdjustDialog } from "@/components/admin/CreditAdjustDialog";
import { AddPaymentDialog } from "@/components/admin/AddPaymentDialog";
import { formatDate, formatDateTime, formatTND } from "@/lib/utils";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Mail, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 bg-slate-800" />
          <Skeleton className="h-32 bg-slate-800" />
          <Skeleton className="h-32 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">User not found</p>
      </div>
    );
  }

  const subscription = user.subscriptions?.[0];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/users")}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{user.fullName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <User className="h-3.5 w-3.5" /> {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreditCard balance={user.creditBalance ?? 0} />

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <StatusBadge status={subscription.status} />
                <Select
                  value={subscription.status}
                  onValueChange={(value) => statusMutation.mutate(value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <p className="text-sm text-slate-500">No subscription</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreditAdjustDialog
              userId={id}
              userName={user.fullName}
              currentBalance={user.creditBalance ?? 0}
            />
            <AddPaymentDialog userId={id} userName={user.fullName} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Credit Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {!user.creditEntries?.length ? (
              <p className="text-sm text-slate-500">No credit entries.</p>
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
                    {user.creditEntries.map(
                      (entry: {
                        id: string;
                        delta: number;
                        note: string | null;
                        createdAt: string;
                        admin: { fullName: string };
                      }) => (
                        <TableRow key={entry.id} className="border-slate-800">
                          <TableCell className="text-slate-400 text-xs">
                            {formatDateTime(entry.createdAt)}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              {entry.delta > 0 ? (
                                <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <ArrowDownCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <span
                                className={`font-semibold text-sm ${
                                  entry.delta > 0 ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {entry.delta > 0 ? "+" : ""}
                                {entry.delta}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">
                            {entry.note || "—"}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">
                            {entry.admin.fullName}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {!user.payments?.length ? (
              <p className="text-sm text-slate-500">No payments recorded.</p>
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
                    {user.payments.map(
                      (payment: {
                        id: string;
                        amountTnd: string;
                        month: string;
                        paidAt: string;
                        note: string | null;
                      }) => (
                        <TableRow key={payment.id} className="border-slate-800">
                          <TableCell className="text-slate-200 font-medium">
                            {payment.month}
                          </TableCell>
                          <TableCell className="text-emerald-400 font-semibold">
                            {formatTND(payment.amountTnd)}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {formatDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {payment.note || "—"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
