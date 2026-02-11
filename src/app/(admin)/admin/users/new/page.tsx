"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function AddUserPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [initialCredits, setInitialCredits] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMonth, setPaymentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState("ACTIVE");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          initialCredits,
          paymentAmount: paymentAmount > 0 ? paymentAmount : undefined,
          paymentMonth: paymentAmount > 0 ? paymentMonth : undefined,
          subscriptionStatus,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.[0]?.message ?? "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User created successfully");
      router.push("/admin/users");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
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
          <h1 className="text-2xl font-bold text-slate-100">Add New User</h1>
          <p className="text-slate-400 mt-1">
            Create a new subscription user
          </p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Subscription Status</Label>
              <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_ACTIVATION">Pending Activation</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Initial Credits</Label>
              <Input
                type="number"
                min={0}
                value={initialCredits || ""}
                onChange={(e) => setInitialCredits(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>

            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                First Payment (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                className="border-slate-700 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !fullName || !email}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {mutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
