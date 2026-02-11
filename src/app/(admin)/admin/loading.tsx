import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <Skeleton className="h-4 w-64 bg-slate-800 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 bg-slate-800 rounded-xl" />
        <Skeleton className="h-80 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
