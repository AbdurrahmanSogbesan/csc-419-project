import StatSection from "./components/StatSection";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CardContent } from "@/components/ui/card";
import React, { ReactNode, useMemo } from "react";
import { useGetLibraryStats } from "@/hooks/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ChartSkeleton() {
  return (
    <ChartCard>
      <Skeleton className="h-6 w-32" />

      <div className="flex flex-col items-center gap-8">
        <div className="relative aspect-square w-full max-w-[250px] p-6">
          <Skeleton className="h-full w-full rounded-full" />
          <div className="absolute inset-[20%] rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </div>
        <div className="flex w-full justify-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

export default function AdminDashboard() {
  const { isLoading: loadingStats, data: statsData } = useGetLibraryStats();

  const chartData = useMemo(
    () => [
      {
        name: "lended",
        value: statsData?.totalLendedBooks || 0,
        fill: "var(--color-lended)",
      },
      {
        name: "available",
        value: statsData?.availableBooks || 0,
        fill: "var(--color-available)",
      },
      {
        name: "overdue",
        value: statsData?.overdueBooks || 0,
        fill: "var(--color-overdue)",
      },
    ],
    [statsData],
  );

  const chartConfig = {
    value: {
      label: "Books",
    },
    lended: {
      label: "Lended",
      color: "#EF4444",
    },
    available: {
      label: "Available",
      color: "#4ADE80",
    },
    overdue: {
      label: "Overdue",
      color: "#3B82F6",
    },
  } satisfies ChartConfig;

  const totalBooks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <div className="flex flex-col gap-6">
      <StatSection statsData={statsData} loading={loadingStats} />
      <div className="flex flex-col gap-6 lg:flex-row">
        <ChartCard>
          <p className="font-medium">No. of Users</p>
        </ChartCard>

        {loadingStats ? (
          <ChartSkeleton />
        ) : (
          <ChartCard>
            <p className="font-medium">Book Availability</p>
            <CardContent className="flex-1">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold md:text-3xl"
                              >
                                {totalBooks.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="hidden fill-muted-foreground md:block"
                              >
                                Total Books
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-[10px] border-[0.8px] border-slate-400 bg-base-white p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
