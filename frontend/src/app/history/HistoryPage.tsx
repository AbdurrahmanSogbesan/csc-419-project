import { DataTable } from "@/components/DataTable";
import { Status, StatusCell } from "@/components/StatusCell";
import TabsFilter from "@/components/TabsFilter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetReservedBooks } from "@/hooks/books";
import {
  buildQueryParams,
  createHistoryTab,
  historyTabLabels,
} from "@/lib/utils";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

const PAGE_SIZE = 15;

const reservedBookColumns: ColumnDef<Reservation>[] = [
  {
    header: "Title",
    accessorKey: "book.title",
  },
  {
    header: "Author",
    accessorKey: "book.author",
  },
  {
    header: "Date Borrowed",
    accessorKey: "borrowedBook.borrowDate",
    cell: ({ row }) =>
      row.original.borrowedBook?.borrowDate
        ? format(row.original.borrowedBook.borrowDate, "d MMM yyyy")
        : "-",
  },
  {
    header: "Date Returned",
    accessorKey: "borrowedBook.returnDate",
    cell: ({ row }) =>
      row.original.borrowedBook?.returnDate
        ? format(row.original.borrowedBook.returnDate, "d MMM yyyy")
        : "-",
  },
  {
    header: "Return Deadline",
    accessorKey: "borrowedBook.dueDate",
    cell: ({ row }) =>
      row.original.borrowedBook?.dueDate
        ? format(row.original.borrowedBook.dueDate, "d MMM yyyy")
        : "-",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <StatusCell status={row.original.status.toLowerCase() as Status} />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 ring-offset-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-transparent"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link to={`/history/books/${row.original.bookId}`}>
              <DropdownMenuItem>View Book History</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function HistoryPage() {
  const [selectedTab, setSelectedTab] = useState<Tab["value"]>(
    historyTabLabels[0].toLowerCase(),
  );
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();

  const { data: reservedBooks, isLoading: isLoadingReservedBooks } =
    useGetReservedBooks({
      ...buildQueryParams(searchParams),
      scope: "user",
      page: 1,
      // :-((, needed cuz UI constraints
      pageSize: 1000,
    });

  const displayedBooks =
    useMemo(
      () =>
        selectedTab === "all"
          ? reservedBooks?.data
          : reservedBooks?.data?.filter(
              (book) => book.status.toLowerCase() === selectedTab,
            ),
      [reservedBooks, selectedTab],
    ) ?? [];

  const tabs = useMemo(
    () =>
      historyTabLabels.map((i) =>
        createHistoryTab(i, reservedBooks?.data ?? []),
      ),
    [reservedBooks?.data],
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        View all your books in one place.
      </p>

      <div className="flex flex-col gap-4">
        <TabsFilter
          tabs={tabs}
          selectedTab={selectedTab}
          onTabClick={setSelectedTab}
        />

        <DataTable
          columns={reservedBookColumns}
          data={displayedBooks}
          isLoading={isLoadingReservedBooks}
          paginationProps={{
            currentPage: page,
            itemsPerPage: PAGE_SIZE,
            pagesCount: Math.ceil(
              (reservedBooks?.data?.length ?? 0) / PAGE_SIZE,
            ),
            onNextPageClick: () => setPage(page + 1),
            onPrevPageClick: () => setPage(page - 1),
          }}
        />
      </div>
    </div>
  );
}
