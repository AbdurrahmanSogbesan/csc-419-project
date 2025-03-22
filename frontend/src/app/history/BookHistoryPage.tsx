import BookDetail from "@/components/BookDetail";
import { Status, StatusCell } from "@/components/StatusCell";
import {
  useDeleteSavedBook,
  useGetReservedBooks,
  useReserveBook,
} from "@/hooks/books";
import { useGetBookDetails, useSaveBook } from "@/hooks/books";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

export default function BookHistoryPage() {
  const { id } = useParams();

  const { data: book, isLoading } = useGetBookDetails(id);
  const queryClient = useQueryClient();

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook(() => {
    queryClient.refetchQueries({ queryKey: ["getBookDetails"] });
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      queryClient.refetchQueries({ queryKey: ["getBookDetails"] });
      toast.success("Book removed from saved successfully");
    });

  const { mutate: reserveBook, isPending: isReservingBook } = useReserveBook(
    () => {
      queryClient.refetchQueries({ queryKey: ["getBookDetails"] });
    },
  );

  const { data: bookHistory, isLoading: loadingHistory } = useGetReservedBooks({
    bookId: Number(id),
    scope: "user",
    page: 1,
    // todo: improve later
    pageSize: 1000,
  });

  const updatingBooks = isSavingBook || isDeletingSavedBook || isReservingBook;
  return (
    <div className="flex flex-col gap-16 pb-16">
      <BookDetail
        isLoading={isLoading}
        book={book}
        savingBook={updatingBooks}
        deleteSavedBook={deleteSavedBook}
        saveBook={saveBook}
        reserveBook={reserveBook}
      />

      <div className="flex flex-col gap-6">
        <p className="text-3xl font-semibold">Book History</p>

        {loadingHistory || isLoading ? (
          <div className="flex h-40 items-center justify-center border border-slate-200">
            <RefreshCw className="animate-spin" />
          </div>
        ) : (
          <div className="flex max-h-[768px] flex-col gap-4 overflow-y-auto">
            {bookHistory?.data?.map((reservation) => (
              <HistoryCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ reservation }: { reservation: Reservation }) {
  const historyData = useMemo(
    () => [
      {
        label: "Reserved",
        value: format(reservation.reservationDate, "MMM d, yyyy"),
      },
      {
        label: "Borrow Deadline",
        value: reservation.reservedUntil
          ? format(reservation.reservedUntil, "MMM d, yyyy")
          : null,
      },
      {
        label: "Borrowed",
        value: reservation.borrowedBook?.borrowDate
          ? format(reservation.borrowedBook.borrowDate, "MMM d, yyyy")
          : null,
      },
      {
        label: "Return Deadline",
        value: reservation.borrowedBook?.dueDate
          ? format(reservation.borrowedBook.dueDate, "MMM d, yyyy")
          : null,
      },
      {
        label: "Returned",
        value: reservation.borrowedBook?.returnDate
          ? format(reservation.borrowedBook.returnDate, "MMM d, yyyy")
          : null,
      },
      {
        label: "Status",
        value: (
          <StatusCell status={reservation.status.toLowerCase() as Status} />
        ),
      },
    ],
    [reservation],
  );

  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-gray-50 p-4 shadow-books-card">
      {historyData.map((item) =>
        item.value ? (
          <div key={item.label} className="flex items-center gap-2">
            <p className="text-sm text-gray-600">{item.label}:</p>
            {typeof item.value === "string" ? (
              <p className="text-base font-medium text-gray-800">
                {item.value}
              </p>
            ) : (
              item.value
            )}
          </div>
        ) : null,
      )}
      {reservation.status === "OVERDUE" && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">Penalty:</p>
          <p className="text-base font-medium text-gray-800">
            You can’t borrow books for the next 2 weeks.
          </p>
        </div>
      )}
    </div>
  );
}
