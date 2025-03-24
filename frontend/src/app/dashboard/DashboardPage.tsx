import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Status, StatusCell } from "@/components/StatusCell";
import BookCard from "./components/BookCard";
import TabsFilter from "@/components/TabsFilter";
import {
  useDeleteSavedBook,
  useGetBooks,
  useGetReservedBooks,
  useReserveBook,
  useSaveBook,
} from "@/hooks/books";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { useAuthStore } from "@/lib/stores/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import {
  checkIfBookIsReserved,
  createHistoryTab,
  historyTabLabels,
} from "@/lib/utils";

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
];

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const [selectedTab, setSelectedTab] = useState<Tab["value"]>(
    historyTabLabels[0].toLowerCase(),
  );

  const { data: books, isLoading } = useGetBooks({
    availabilityStatus: "available",
    popularBooks: true,
    pageSize: 4,
  });

  const { data: reservedBooks, isLoading: isLoadingReservedBooks } =
    useGetReservedBooks({
      scope: "user",
      page: 1,
      // :-((, needed cuz UI constraints
      pageSize: 1000,
    });

  const tabs = useMemo(
    () =>
      historyTabLabels.map((i) =>
        createHistoryTab(i, reservedBooks?.data ?? []),
      ),
    [reservedBooks?.data],
  );

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook(() => {
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      toast.success("Book removed from saved successfully");
    });

  const { mutate: reserveBook, isPending: isReservingBook } = useReserveBook();

  const updatingBooks = isSavingBook || isDeletingSavedBook || isReservingBook;

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

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        Discover a vast collection of books to enhance your computer science
        journey.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))
        ) : books && books.data.length > 0 ? (
          books.data.map((book) => {
            const isSaved = book.savedBooks?.some(
              (savedBook) => savedBook.userId === user?.id,
            );
            const isReserved = checkIfBookIsReserved(
              book.reservations ?? [],
              user?.id as string,
            );
            return (
              <BookCard
                key={book.id}
                book={{ ...book, isSaved, isReserved }}
                onReserve={() => reserveBook(book.id)}
                onSave={() =>
                  isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
                }
                disabled={updatingBooks}
                onCardClick={
                  updatingBooks
                    ? undefined
                    : () => {
                        navigate(`/dashboard/books/${book.id}`);
                      }
                }
              />
            );
          })
        ) : (
          <p className="col-span-full my-20 text-center text-gray-600">
            No books found
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">Books</p>
          <p className="text-base text-gray-600 md:text-sm">
            View all your books in one place.
          </p>
        </div>

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
                (reservedBooks?.pagination?.total ?? 0) / PAGE_SIZE,
              ),
              onNextPageClick: () => setPage(page + 1),
              onPrevPageClick: () => setPage(page - 1),
            }}
          />
        </div>
      </div>
    </div>
  );
}
