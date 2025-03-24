import StatSection from "./components/StatSection";
import { Label, Pie, PieChart, YAxis } from "recharts";
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
import { cn, processDataByMonth } from "@/lib/utils";
import { useGetUsers } from "@/hooks/users";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

type ChartSkeletonProps = {
  variant?: "pie" | "bar";
};

function ChartSkeleton({ variant = "pie" }: ChartSkeletonProps) {
  // Generate random heights for bars between 20px and 200px
  const barHeights = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 180 + 20),
  );

  return (
    <ChartCard>
      <Skeleton className="h-6 w-32" />

      {variant === "pie" ? (
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
      ) : (
        <div className="p-0 pt-0 md:p-6">
          <div className="relative h-[250px] w-full">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {barHeights.map((height, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t-md"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

export default function AdminDashboard() {
  const { isLoading: loadingStats, data: statsData } = useGetLibraryStats();
  const { isLoading: loadingUsers, data: usersData } = useGetUsers({
    // need all users for aggregated stats
    pageSize: 1000,
  });

  const userChartData = useMemo(() => {
    return processDataByMonth(usersData?.data || [], "users");
  }, [usersData?.data]);

  const userChartConfig = {
    users: {
      label: "Users",
      color: "#7E22CE",
    },
  } satisfies ChartConfig;

  const availableBookChartData = useMemo(
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

  const availableBookChartConfig = {
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
    return availableBookChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [availableBookChartData]);

  return (
    <div className="flex flex-col gap-6">
      <StatSection statsData={statsData} loading={loadingStats} />
      <div className="flex flex-col gap-6 lg:flex-row">
        {loadingUsers ? (
          <ChartSkeleton variant="bar" />
        ) : (
          <ChartCard>
            <p className="font-medium">No. of Users</p>
            <CardContent className="flex-1 p-0 md:p-6">
              {usersData && usersData.data.length > 0 ? (
                <ChartContainer
                  config={userChartConfig}
                  className="mx-auto h-full max-h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    margin={{ left: -25 }}
                    data={userChartData}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => label}
                        />
                      }
                    />
                    <Bar
                      dataKey="users"
                      fill="var(--color-users)"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="users" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  No users found
                </p>
              )}
            </CardContent>
          </ChartCard>
        )}

        {loadingStats ? (
          <ChartSkeleton variant="pie" />
        ) : (
          <ChartCard>
            <p className="font-medium">Book Availability</p>
            <CardContent className="flex-1 p-0 md:p-6">
              <ChartContainer
                config={availableBookChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={availableBookChartData}
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
