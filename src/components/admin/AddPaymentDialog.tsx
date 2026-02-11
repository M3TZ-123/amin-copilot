"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface AddPaymentDialogProps {
  userId: string;
  userName: string;
}

export function AddPaymentDialog({ userId, userName }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amountTnd: amount,
          month,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to record payment");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
      setAmount(0);
      setNote("");
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          <DollarSign className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Record Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Record a payment from {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-slate-300">Amount (TND)</Label>
            <Input
              type="number"
              step="0.001"
              min={0}
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.000"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Month</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Monthly payment, Cash..."
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-slate-700 text-slate-400"
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={amount <= 0 || mutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {mutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
