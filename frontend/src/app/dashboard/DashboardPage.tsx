import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Status, StatusCell } from "@/components/StatusCell";
import BookCard from "./components/BookCard";
import Tabs from "@/components/Tabs";
import { useDeleteSavedBook, useGetBooks, useSaveBook } from "@/hooks/books";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { useAuthStore } from "@/lib/stores/auth";

const tabs: Tab[] = [
  { label: "All", count: 15, value: "all" },
  { label: "Borrowed", count: 10, value: "borrowed" },
  { label: "Reserved", count: 5, value: "reserved" },
  { label: "Returned", count: 2, value: "returned" },
];

const loanedBooks = [
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

const loanBookHeaders = [
  "Title",
  "Author",
  "Date Borrowed",
  "Date Returned",
  "Return Date",
  "Status",
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const [selectedTab, setSelectedTab] = useState(tabs[0].value);

  const { data: books, isLoading } = useGetBooks({
    availabilityStatus: "available",
  });

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook();
  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook();

  const updatingSavedBooks = isSavingBook || isDeletingSavedBook;

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
            return (
              <BookCard
                key={book.id}
                book={{ ...book, isSaved: isSaved ?? false }}
                onReserve={() => {}}
                onSave={() =>
                  updatingSavedBooks
                    ? undefined
                    : isSaved
                      ? deleteSavedBook(book.id)
                      : saveBook(book.id)
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
          <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabClick={setSelectedTab}
          />

          <Table className="border">
            <TableHeader>
              <TableRow>
                {loanBookHeaders.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanedBooks
                .filter((book) =>
                  selectedTab === "all"
                    ? book
                    : book.status.toLowerCase() === selectedTab,
                )
                .map((book, index) => (
                  <TableRow key={index}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      {format(book.borrowedDate, "d MMM yyyy")}
                    </TableCell>
                    <TableCell>{format(book.dueDate, "d MMM yyyy")}</TableCell>
                    <TableCell>
                      {format(book.returnDate, "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusCell
                        status={book.status.toLowerCase() as Status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
