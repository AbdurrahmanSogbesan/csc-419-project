import { ConfirmModal } from "@/components/confirm-modal";
import { DataTable } from "@/components/DataTable";
import SearchBar from "@/components/SearchBar";
import { Status } from "@/components/StatusCell";
import { StatusCell } from "@/components/StatusCell";
import TabsFilter from "@/components/TabsFilter";
import CustomTooltip from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetReservedBooks,
  usePickupBook,
  useReturnBook,
} from "@/hooks/books";
import { useDebounce } from "@/hooks/use-debounce";
import { createHistoryTab, historyTabLabels } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 12;

export default function BookStatusPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<Tab["value"]>(
    historyTabLabels[0].toLowerCase(),
  );
  const [bookModalData, setBookModalData] = useState<{
    isOpen: boolean;
    data: (Partial<Book> & { userId?: string }) | undefined;
    type: "pickup" | "return" | undefined;
  }>({ isOpen: false, data: undefined, type: undefined });

  const debouncedSearch = useDebounce(search, 500);

  const { data: reservedBooks, isLoading: isLoadingReservedBooks } =
    useGetReservedBooks({
      // :-((, needed cuz UI constraints
      pageSize: 1000,
      search: debouncedSearch,
    });

  const { mutate: pickupBook, isPending: isPickingUpBook } = usePickupBook();
  const { mutate: returnBook, isPending: isReturningBook } = useReturnBook();

  const tabs = useMemo(
    () =>
      historyTabLabels.map((i) =>
        createHistoryTab(i, reservedBooks?.data ?? []),
      ),
    [reservedBooks?.data],
  );

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

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const reservedBookColumns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        header: "User",
        accessorKey: "user.name",
        cell: ({ row }) => (
          <CustomTooltip
            trigger={<p>{row.original.user?.name.split(" ")[0]}</p>}
            content={row.original.user?.name}
          />
        ),
      },
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
                <DropdownMenuItem
                  disabled={row.original.status !== "RESERVED"}
                  onClick={() => {
                    setBookModalData({
                      isOpen: true,
                      data: {
                        ...row.original.book,
                        userId: row.original?.userId,
                      },
                      type: "pickup",
                    });
                  }}
                >
                  Mark as Picked Up
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={
                    !["BORROWED", "OVERDUE"].includes(row.original.status)
                  }
                  onClick={() => {
                    setBookModalData({
                      isOpen: true,
                      data: {
                        ...row.original.book,
                        userId: row.original?.userId,
                      },
                      type: "return",
                    });
                  }}
                >
                  Mark as Returned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        className="md:max-w-[506px]"
        searchValue={search}
        onSearchValueChange={setSearch}
        onClear={() => setSearch("")}
      />

      <TabsFilter
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={(tab) => {
          if (tab !== selectedTab) {
            setPage(1);
            setSelectedTab(tab);
          }
        }}
      />

      <DataTable
        columns={reservedBookColumns}
        data={displayedBooks}
        isLoading={isLoadingReservedBooks}
        paginationProps={{
          currentPage: page,
          itemsPerPage: PAGE_SIZE,
          pagesCount: Math.ceil(
            (reservedBooks?.pagination?.total ?? 0) / PAGE_SIZE,
          ),
          onNextPageClick: () => setPage(page + 1),
          onPrevPageClick: () => setPage(page - 1),
        }}
      />

      <ConfirmModal
        title={`${bookModalData?.type === "pickup" ? "Mark as Picked Up" : bookModalData?.type === "return" ? "Mark as Returned" : ""} Book - ${bookModalData?.data?.title}?`}
        description={`This action cannot be undone. This will mark the book as ${
          bookModalData?.type === "pickup" ? "picked up" : "returned"
        }.`}
        onConfirm={() => {
          if (bookModalData?.type === "pickup") {
            pickupBook({
              bookId: bookModalData?.data?.id as string,
              userId: bookModalData?.data?.userId as string,
            });
          } else {
            returnBook({
              bookId: bookModalData?.data?.id as string,
              userId: bookModalData?.data?.userId as string,
            });
          }
        }}
        isLoading={isPickingUpBook || isReturningBook}
        open={bookModalData?.isOpen}
        onOpenChange={() =>
          setBookModalData((prev) => ({
            isOpen: !prev?.isOpen,
            data: prev?.isOpen ? undefined : prev?.data,
            type: prev?.type ? undefined : prev?.type,
          }))
        }
      />
    </div>
  );
}
