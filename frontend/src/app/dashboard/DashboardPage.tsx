import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Status, StatusCell } from "@/components/StatusCell";
import BookCard from "./components/BookCard";
import TabsFilter from "@/components/TabsFilter";
import {
  useDeleteSavedBook,
  useGetBooks,
  useReserveBook,
  useSaveBook,
} from "@/hooks/books";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { useAuthStore } from "@/lib/stores/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { checkIfBookIsReserved } from "@/lib/utils";

const bookReservations = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    borrowedDate: "2022-01-01",
    dueDate: "2022-01-15",
    returnDate: "2022-01-10",
    status: "RETURNED",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    borrowedDate: "2022-02-01",
    dueDate: "2022-02-15",
    returnDate: "2022-02-20",
    status: "OVERDUE",
  },
  {
    title: "1984",
    author: "George Orwell",
    borrowedDate: "2022-03-01",
    dueDate: "2022-03-15",
    returnDate: "2022-03-10",
    status: "RESERVED",
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    borrowedDate: "2022-04-01",
    dueDate: "2022-04-15",
    returnDate: "2022-04-10",
    status: "RETURNED",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    borrowedDate: "2022-05-01",
    dueDate: "2022-05-15",
    returnDate: "2022-05-10",
    status: "BORROWED",
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    borrowedDate: "2022-06-01",
    dueDate: "2022-06-15",
    returnDate: "2022-06-10",
    status: "RETURNED",
  },
];

const dummyTabs: Tab[] = [
  { label: "All", count: 15, value: "all" },
  { label: "Borrowed", count: 10, value: "borrowed" },
  { label: "Reserved", count: 5, value: "reserved" },
  { label: "Returned", count: 2, value: "returned" },
  { label: "Overdue", count: 2, value: "overdue" },
];

const reservedBookColumns: ColumnDef<(typeof bookReservations)[number]>[] = [
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Author",
    accessorKey: "author",
  },
  {
    header: "Date Borrowed",
    accessorKey: "borrowedDate",
    cell: ({ row }) => format(row.original.borrowedDate, "d MMM yyyy"),
  },
  {
    header: "Date Returned",
    accessorKey: "returnDate",
    cell: ({ row }) => format(row.original.returnDate, "d MMM yyyy"),
  },
  {
    header: "Return Deadline",
    accessorKey: "dueDate",
    cell: ({ row }) => format(row.original.dueDate, "d MMM yyyy"),
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

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(dummyTabs[0].value);

  const { data: books, isLoading } = useGetBooks({
    availabilityStatus: "available",
    popularBooks: true,
  });

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook(() => {
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      toast.success("Book removed from saved successfully");
    });

  const { mutate: reserveBook, isPending: isReservingBook } = useReserveBook();

  const updatingBooks = isSavingBook || isDeletingSavedBook || isReservingBook;

  const displayedBooks = useMemo(
    () =>
      bookReservations.filter((book) =>
        selectedTab == "all" ? book : book.status.toLowerCase() === selectedTab,
      ),
    [selectedTab],
  );

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
        ) : books && books.length > 0 ? (
          books.slice(0, 4).map((book) => {
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
            tabs={dummyTabs}
            selectedTab={selectedTab}
            onTabClick={setSelectedTab}
          />

          <DataTable
            columns={reservedBookColumns}
            data={displayedBooks}
            pagination
          />
        </div>
      </div>
    </div>
  );
}
