import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Status = "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING_ACTIVATION: {
    label: "Pending",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
