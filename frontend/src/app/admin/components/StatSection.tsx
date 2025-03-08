import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

const statClasses = {
  borderColor: {
    amber: "border-amber-400",
    sky: "border-sky-400",
    teal: "border-teal-400",
    green: "border-green-500",
    red: "border-pink-600",
  },
  bgColor: {
    amber: "bg-yellow-50",
    sky: "bg-blue-50",
    teal: "bg-teal-50",
    green: "bg-green-50",
    red: "bg-pink-100",
  },
  bookIconColor: {
    amber: "bg-amber-400",
    sky: "bg-sky-400",
    teal: "bg-teal-400",
    green: "bg-green-500",
    red: "bg-pink-600",
  },
};

type StatColor = keyof typeof statClasses.borderColor;

export default function StatSection({
  statsData,
  loading,
}: {
  statsData?: LibraryStats;
  loading: boolean;
}) {
  const navigate = useNavigate();

  const stats: {
    label: string;
    value: number | string;
    color: StatColor;
  }[] = useMemo(
    () => [
      {
        label: "Total Books",
        value: statsData?.totalBooks || 0,
        color: "amber",
      },
      {
        label: "Lended Books",
        value: statsData?.totalLendedBooks || 0,
        color: "sky",
      },
      {
        label: "Available Books",
        value: statsData?.availableBooks || 0,
        color: "teal",
      },
      {
        label: "Total Users",
        value: statsData?.totalUsers || 0,
        color: "green",
      },
      {
        label: "Overdue Books",
        value: statsData?.overdueBooks || 0,
        color: "red",
      },
    ],
    [statsData],
  );

  return (
    <div className="grid grid-cols-1 gap-8 rounded-[10px] border-[0.8px] border-slate-400 bg-base-white p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {loading
        ? Array.from({ length: 5 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        : stats.map(({ label, value, color }) => (
            <StatCard
              key={label}
              color={color}
              title={label}
              value={value}
              onClick={() =>
                label.toLowerCase().includes("user")
                  ? navigate("/admin?tab=users")
                  : navigate("/admin?tab=books")
              }
            />
          ))}
    </div>
  );
}

function StatCard({
  color,
  title,
  value,
  onClick,
}: {
  color: StatColor;
  title: string;
  value: number | string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-fit flex-col items-center gap-4 rounded-[10px] border-[0.8px] py-6",
        statClasses.borderColor[color],
        statClasses.bgColor[color],
      )}
    >
      <div
        className={cn(
          "flex size-[50px] items-center justify-center rounded-[5px]",
          statClasses.bookIconColor[color],
        )}
      >
        <BookOpen color="white" size={24} />
      </div>
      <div className="mt-1 flex flex-col items-center gap-[5px]">
        <p className="font-medium">{title}</p>
        <p className="text-xl font-semibold">{value.toLocaleString()}</p>
      </div>

      <Button
        variant="secondary"
        className="border-[0.2px] border-slate-500 bg-zinc-50 hover:bg-zinc-100"
        onClick={onClick}
      >
        View Details
      </Button>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex min-w-fit flex-col items-center gap-4 rounded-[10px] border-[0.8px] border-gray-200 bg-gray-50 py-6">
      <Skeleton className="size-[50px] rounded-[5px]" />
      <div className="mt-1 flex flex-col items-center gap-[5px]">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
