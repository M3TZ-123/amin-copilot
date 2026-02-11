"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RefreshCw, UserPlus, Zap, Users, Clock, CheckCircle2 } from "lucide-react";

type UserWithSub = {
  id: string;
  clerkId: string;
  fullName: string;
  email: string;
  createdAt: string;
  latestSubscription: {
    status: "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "EXPIRED";
  } | null;
  creditBalance: number;
};

export default function AddUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activatingUser, setActivatingUser] = useState<UserWithSub | null>(null);
  const [initialCredits, setInitialCredits] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMonth, setPaymentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Fetch all users
  const { data: users, isLoading } = useQuery<UserWithSub[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Sort: pending first, then by date
  const pendingUsers =
    users?.filter(
      (u) => u.latestSubscription?.status === "PENDING_ACTIVATION"
    ) ?? [];
  const activeUsers =
    users?.filter(
      (u) =>
        u.latestSubscription?.status !== "PENDING_ACTIVATION" &&
        u.latestSubscription !== null
    ) ?? [];
  const noSubUsers = users?.filter((u) => !u.latestSubscription) ?? [];

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Synced ${data.synced} users from Clerk (${data.created} new, ${data.updated} updated)`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialCredits,
          paymentAmount: paymentAmount > 0 ? paymentAmount : undefined,
          paymentMonth: paymentAmount > 0 ? paymentMonth : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to activate");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User activated successfully!");
      setActivatingUser(null);
      setInitialCredits(0);
      setPaymentAmount(0);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Add User</h1>
          <p className="text-slate-400 mt-1">
            Sync Clerk users, activate pending subscriptions, or create new users manually
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="border-slate-700 text-slate-300 hover:text-slate-100"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`}
            />
            {syncMutation.isPending ? "Syncing..." : "Sync from Clerk"}
          </Button>
          <Button
            onClick={() => router.push("/admin/users/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Manual Add
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2.5">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {pendingUsers.length}
                </p>
                <p className="text-sm text-slate-400">Pending Activation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {activeUsers.filter(
                    (u) => u.latestSubscription?.status === "ACTIVE"
                  ).length}
                </p>
                <p className="text-sm text-slate-400">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {(users?.length ?? 0)}
                </p>
                <p className="text-sm text-slate-400">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Activation Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            Pending Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-800 rounded animate-pulse"
                />
              ))}
            </div>
          ) : pendingUsers.length === 0 && noSubUsers.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users pending activation</p>
              <p className="text-slate-500 text-sm mt-1">
                Click &ldquo;Sync from Clerk&rdquo; to import users who signed up
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Signed Up</TableHead>
                    <TableHead className="text-slate-400 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...pendingUsers, ...noSubUsers].map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell className="text-slate-200 font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.latestSubscription ? (
                          <StatusBadge
                            status={user.latestSubscription.status}
                          />
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/50 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                            No Subscription
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActivatingUser(user);
                            setInitialCredits(0);
                            setPaymentAmount(0);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1.5" />
                          Activate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Registered Users (already active) */}
      {activeUsers.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Already Activated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <TableCell className="text-slate-200 font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.latestSubscription && (
                          <StatusBadge
                            status={user.latestSubscription.status}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-blue-400 font-semibold">
                        {user.creditBalance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activate Dialog */}
      <Dialog
        open={!!activatingUser}
        onOpenChange={(open) => !open && setActivatingUser(null)}
      >
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              Activate Subscription
            </DialogTitle>
          </DialogHeader>
          {activatingUser && (
            <div className="space-y-5">
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="font-medium text-slate-200">
                  {activatingUser.fullName}
                </p>
                <p className="text-sm text-slate-400">{activatingUser.email}</p>
              </div>

              <div>
                <Label className="text-slate-300">Initial Credits</Label>
                <Input
                  type="number"
                  min={0}
                  value={initialCredits || ""}
                  onChange={(e) =>
                    setInitialCredits(parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                />
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  First Payment (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Amount (TND)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min={0}
                      value={paymentAmount || ""}
                      onChange={(e) =>
                        setPaymentAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.000"
                      className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Month</Label>
                    <Input
                      type="month"
                      value={paymentMonth}
                      onChange={(e) => setPaymentMonth(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivatingUser(null)}
              className="border-slate-700 text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                activatingUser && activateMutation.mutate(activatingUser.id)
              }
              disabled={activateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {activateMutation.isPending ? "Activating..." : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
