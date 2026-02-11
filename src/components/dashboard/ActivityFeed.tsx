import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface CreditEntryDisplay {
  id: string;
  delta: number;
  note: string | null;
  createdAt: Date | string;
  admin: { fullName: string };
}

interface ActivityFeedProps {
  entries: CreditEntryDisplay[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-300">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No credit activity yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-300">
          Recent Credit Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
          >
            <div className="flex items-center gap-3">
              {entry.delta > 0 ? (
                <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-red-400" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {entry.note || (entry.delta > 0 ? "Credit top-up" : "Credit deduction")}
                </p>
                <p className="text-xs text-slate-500">
                  by {entry.admin.fullName} &middot;{" "}
                  {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                entry.delta > 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {entry.delta > 0 ? "+" : ""}
              {entry.delta}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
