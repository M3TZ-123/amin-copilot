"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDate, formatTND } from "@/lib/utils";
import { Search, UserPlus, Eye } from "lucide-react";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const filteredUsers = users?.filter(
    (user: { fullName: string; email: string }) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        <Button
          onClick={() => router.push("/admin/users/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Credits</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Last Payment</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredUsers?.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map(
                (user: {
                  id: string;
                  fullName: string;
                  email: string;
                  creditBalance: number;
                  latestSubscription: { status: "ACTIVE" | "SUSPENDED" | "EXPIRED" } | null;
                  lastPayment: { amountTnd: string; paidAt: string } | null;
                }) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <TableCell className="text-slate-200 font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-slate-400">{user.email}</TableCell>
                    <TableCell className="text-blue-400 font-semibold">
                      {user.creditBalance}
                    </TableCell>
                    <TableCell>
                      {user.latestSubscription ? (
                        <StatusBadge status={user.latestSubscription.status} />
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {user.lastPayment
                        ? `${formatTND(user.lastPayment.amountTnd)} (${formatDate(user.lastPayment.paidAt)})`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
