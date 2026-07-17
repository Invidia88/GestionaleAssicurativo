import { Skeleton } from "@/components/ui/skeleton";

export default function CaricamentoDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, indice) => (
          <Skeleton key={indice} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
