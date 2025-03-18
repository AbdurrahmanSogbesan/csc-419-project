import {
  useDeleteSavedBook,
  useGetBooks,
  useReserveBook,
  useSaveBook,
} from "@/hooks/books";
import { BookOpen } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import BookCard from "./components/BookCard";
import { useAuthStore } from "@/lib/stores/auth";
import BookRating from "@/components/BookRating";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { buildQueryParams, checkIfBookIsReserved } from "@/lib/utils";
import NoResults from "@/components/NoResults";

export default function SearchBooksPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);

  const { data: books, isLoading: loadingBooks } = useGetBooks({
    ...buildQueryParams(searchParams),
  });

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook(() => {
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      toast.success("Book removed from saved successfully");
    });

  const { mutate: reserveBook, isPending: isReservingBook } = useReserveBook();

  const updatingSavedBooks =
    isSavingBook || isDeletingSavedBook || isReservingBook;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {loadingBooks ? (
        Array.from({ length: 4 }).map((_, index) => (
          <BookCardItemSkeleton key={index} />
        ))
      ) : books && books.length > 0 ? (
        books.map((book) => {
          const isSaved = book.savedBooks?.some(
            (savedBook) => savedBook.userId === user?.id,
          );
          const isReserved = checkIfBookIsReserved(
            book.reservations ?? [],
            user?.id as string,
          );
          return (
            <BookCardItem
              key={book.id}
              book={book}
              isSaved={isSaved}
              isReserved={isReserved}
              onSave={() =>
                isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
              }
              onReserve={() => reserveBook(book.id)}
              disabled={updatingSavedBooks}
              onCardClick={
                updatingSavedBooks
                  ? undefined
                  : () => {
                      navigate(`/dashboard/books/${book.id}`);
                    }
              }
            />
          );
        })
      ) : (
        <NoResults />
      )}
    </div>
  );
}

function BookCardItemSkeleton() {
  return (
    <div className="flex max-h-[unset] flex-col items-center gap-7 rounded-[16px] bg-gray-50 p-4 shadow-books-card md:max-h-[400px] md:flex-row md:items-start md:gap-6">
      <BookCardSkeleton hideBookInfo className="max-w-[261.75px]" />
      <div className="flex w-full flex-1 flex-col gap-2 self-start">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}

function BookCardItem({
  book,
  isSaved,
  isReserved,
  onSave,
  onReserve,
  disabled,
  onCardClick,
}: {
  book: Book;
  isSaved?: boolean;
  isReserved?: boolean;
  onSave: VoidFunction;
  onReserve: VoidFunction;
  disabled: boolean;
  onCardClick?: VoidFunction;
}) {
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  useEffect(() => {
    const element = descRef.current;
    if (element) {
      setIsTextTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [book.description]);

  return (
    <div className="flex max-h-[unset] flex-col items-center gap-7 rounded-[16px] bg-gray-50 p-4 shadow-books-card md:max-h-[400px] md:flex-row md:items-start md:gap-6">
      <BookCard
        book={{ ...book, isSaved, isReserved }}
        onSave={onSave}
        onReserve={onReserve}
        disabled={disabled}
        onCardClick={onCardClick}
        className="max-w-[261.75px]"
        hideBookInfo
      />
      <div className="flex w-full flex-1 flex-col gap-2 self-start">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-semibold">{book.title}</p>
          <p className="text-base font-medium text-gray-600">
            by {book.author}
          </p>
        </div>
        <div className="flex items-center gap-1 text-gray-800">
          <BookOpen size={24} />
          <p className="text-sm font-medium text-gray-600">
            {book.borrowCount} borrowed
          </p>
        </div>
        <BookRating ratingCount={135} ratingValue={4} />

        <p ref={descRef} className="mt-4 line-clamp-3 text-base text-gray-600">
          {book.description || "No description available"}
        </p>

        {isTextTruncated && (
          <Button
            variant="ghost"
            size="sm"
            className="w-fit px-0 underline"
            onClick={onCardClick}
          >
            Read more
          </Button>
        )}
      </div>
    </div>
  );
}
