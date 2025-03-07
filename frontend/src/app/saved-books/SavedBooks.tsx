import { useDeleteSavedBook, useGetSavedBooks } from "@/hooks/books";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import BookCardSkeleton from "../dashboard/components/BookCardSkeleton";
import BookCard from "../dashboard/components/BookCard";
import { useNavigate } from "react-router";

export default function SavedBooks() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: savedBooks, isLoading } = useGetSavedBooks({
    availabilityStatus: "available",
    popularBooks: true,
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      queryClient.invalidateQueries({ queryKey: ["getSavedBooks"] });
      queryClient.refetchQueries({ queryKey: ["getBooks"] });
      toast.success("Book removed from saved successfully");
    });

  const updatingSavedBooks = isDeletingSavedBook;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        View all your saved books.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))
        ) : savedBooks && savedBooks.length > 0 ? (
          savedBooks.slice(0, 4).map((savedBook) => {
            return (
              <BookCard
                key={savedBook.id}
                book={{ ...(savedBook.book as Book), isSaved: true }}
                onReserve={() => {}}
                onSave={() => deleteSavedBook(savedBook.bookId as string)}
                disabled={updatingSavedBooks}
                onCardClick={
                  updatingSavedBooks
                    ? undefined
                    : () => {
                        navigate(`/saved-books/${savedBook.bookId}`);
                      }
                }
              />
            );
          })
        ) : (
          <p className="col-span-full my-20 text-center text-gray-600">
            No saved books found
          </p>
        )}
      </div>
    </div>
  );
}
