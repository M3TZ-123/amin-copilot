import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Skeleton className="h-8 w-32 bg-slate-800" />
        <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
      </div>
      <Skeleton className="h-72 bg-slate-800 rounded-xl" />
      <Skeleton className="h-72 bg-slate-800 rounded-xl" />
    </div>
  );
}
