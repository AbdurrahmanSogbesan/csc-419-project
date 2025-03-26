import { useNavigate, useParams } from "react-router";
import {
  useDeleteSavedBook,
  useGetBookDetails,
  useGetBooks,
  useReserveBook,
  useSaveBook,
} from "@/hooks/books";
import BookCard from "./components/BookCard";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import BookDetail from "@/components/BookDetail";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { useAuthStore } from "@/lib/stores/auth";
import { checkIfBookIsReserved } from "@/lib/utils";

export default function BookDetailsPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data: book, isLoading } = useGetBookDetails(id);

  const { data: similarBooks, isLoading: loadingSimilarBooks } = useGetBooks(
    {
      category: book?.category,
      availabilityStatus: "available",
      pageSize: 4,
    },
    [id],
    {
      enabled: !!book,
    },
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
        <p className="text-3xl font-semibold">Similar books</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading || loadingSimilarBooks ? (
            Array.from({ length: 4 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))
          ) : similarBooks && similarBooks.data.length > 0 ? (
            similarBooks.data
              .filter((book) => Number(book.id) !== Number(id))
              .map((book) => {
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
            <p className="col-span-full text-center text-sm text-gray-600">
              No similar books found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
