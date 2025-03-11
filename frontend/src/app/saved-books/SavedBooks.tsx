import { useDeleteSavedBook, useGetSavedBooks } from "@/hooks/books";

import { toast } from "sonner";
import BookCardSkeleton from "../dashboard/components/BookCardSkeleton";
import BookCard from "../dashboard/components/BookCard";
import { useNavigate, useSearchParams } from "react-router";
import { buildQueryParams } from "@/lib/utils";
import NoResults from "@/components/NoResults";

export default function SavedBooks() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const { data: savedBooks, isLoading } = useGetSavedBooks(
    buildQueryParams(searchParams),
  );

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      toast.success("Book removed from saved successfully");
    });

  const updatingSavedBooks = isDeletingSavedBook;
  return (
    <div className="flex flex-1 flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        View all your saved books.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      ) : savedBooks && savedBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {savedBooks.map((savedBook) => {
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
          })}
        </div>
      ) : (
        <NoResults description="You haven't saved any books yet. Browse our collection and save your favorite books." />
      )}
    </div>
  );
}
