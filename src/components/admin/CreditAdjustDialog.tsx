"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";

interface CreditAdjustDialogProps {
  userId: string;
  userName: string;
  currentBalance: number;
}

export function CreditAdjustDialog({
  userId,
  userName,
  currentBalance,
}: CreditAdjustDialogProps) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState<number>(0);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"add" | "deduct">("add");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const actualDelta = mode === "deduct" ? -Math.abs(delta) : Math.abs(delta);
      const res = await fetch(`/api/users/${userId}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: actualDelta, note: note || undefined }),
      });
      if (!res.ok) throw new Error("Failed to adjust credits");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Credits ${mode === "add" ? "added" : "deducted"} successfully. New balance: ${data.balance}`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      setOpen(false);
      setDelta(0);
      setNote("");
    },
    onError: () => {
      toast.error("Failed to adjust credits");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Adjust Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Adjust Credits</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adjust credits for {userName}. Current balance:{" "}
            <span className="text-blue-400 font-semibold">{currentBalance}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "add" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("add")}
              className={mode === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-700 text-slate-400"}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
            <Button
              variant={mode === "deduct" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("deduct")}
              className={mode === "deduct" ? "bg-red-600 hover:bg-red-700" : "border-slate-700 text-slate-400"}
            >
              <Minus className="h-4 w-4 mr-1" /> Deduct
            </Button>
          </div>

          <div>
            <Label className="text-slate-300">Amount</Label>
            <Input
              type="number"
              min={1}
              value={delta || ""}
              onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
              placeholder="Enter amount"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Monthly allocation, Manual correction..."
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
            disabled={delta <= 0 || mutation.isPending}
            className={
              mode === "add"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {mutation.isPending
              ? "Processing..."
              : `${mode === "add" ? "Add" : "Deduct"} ${delta} credits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
