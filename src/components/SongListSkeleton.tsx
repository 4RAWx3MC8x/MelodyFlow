
import { Skeleton } from "@/components/ui/skeleton";

export function SongListSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-[auto,1fr,auto,auto] gap-x-4 items-center px-4 py-2 border-b border-border text-sm text-muted-foreground font-medium">
        <div className="w-12 text-center">
          <Skeleton className="h-4 w-6 mx-auto" />
        </div>
        <div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="w-20 text-right">
            <Skeleton className="h-4 w-12 ml-auto" />
        </div>
        <div className="w-24 text-right">
            <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[auto,1fr,auto,auto] gap-x-4 items-center px-4 h-16 border-b border-border/20">
            <div className="w-12 text-center">
                <Skeleton className="h-4 w-4 rounded-full mx-auto" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="w-20 text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
            </div>
            <div className="w-24 flex items-center justify-end gap-2">
                 <Skeleton className="h-6 w-6 rounded-full" />
                 <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
