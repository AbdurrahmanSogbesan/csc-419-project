import { Skeleton } from "@/components/ui/skeleton";

export default function BookCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="h-[320px] w-full rounded-md object-cover" />
      <div className="flex flex-col gap-[2px]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
