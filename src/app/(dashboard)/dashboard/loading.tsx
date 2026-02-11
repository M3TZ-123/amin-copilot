import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Skeleton className="h-8 w-64 bg-slate-800" />
        <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-36 bg-slate-800 rounded-xl" />
        <Skeleton className="h-36 bg-slate-800 rounded-xl" />
        <Skeleton className="h-36 bg-slate-800 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-slate-800 rounded-xl" />
        <Skeleton className="h-64 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
