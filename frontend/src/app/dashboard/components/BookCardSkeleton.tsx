import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function BookCardSkeleton({
  className,
  canSave,
  hideBookInfo,
}: {
  className?: string;
  canSave?: boolean;
  hideBookInfo?: boolean;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <Skeleton className="h-[320px] w-full rounded-md object-cover" />
      {!hideBookInfo && (
        <div className="flex flex-col gap-[2px]">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        {canSave && <Skeleton className="h-10 w-full rounded-lg" />}
      </div>
    </div>
  );
}
