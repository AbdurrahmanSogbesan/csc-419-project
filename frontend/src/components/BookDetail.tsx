import BookCardSkeleton from "@/app/dashboard/components/BookCardSkeleton";
import { Skeleton } from "./ui/skeleton";
import BookCard from "@/app/dashboard/components/BookCard";
import { useAuthStore } from "@/lib/stores/auth";
import { checkIfBookIsReserved } from "@/lib/utils";
import BookRating from "./BookRating";
import { BookOpen } from "lucide-react";

export default function BookDetail({
  isLoading,
  book,
  savingBook,
  deleteSavedBook,
  saveBook,
  reserveBook,
}: {
  isLoading: boolean;
  book?: Book;
  savingBook: boolean;
  deleteSavedBook: (bookId: string) => void;
  saveBook: (bookId: string) => void;
  reserveBook: (bookId: string) => void;
}) {
  const user = useAuthStore((s) => s.user);

  const isSaved = book?.savedBooks?.some(
    (savedBook) => savedBook.userId === user?.id,
  );

  const isReserved = checkIfBookIsReserved(
    book?.reservations ?? [],
    user?.id as string,
  );

  return (
    <div className="mt-6 flex flex-col gap-6 md:flex-row">
      {isLoading ? (
        <>
          <BookCardSkeleton
            className="flex-shrink-0 self-center sm:max-w-[261.7px] md:self-start"
            canSave
          />
          <Skeleton className="min-h-[400px] w-full flex-1" />
        </>
      ) : book ? (
        <>
          <BookCard
            book={{ ...book, isSaved, isReserved }}
            className="flex-shrink-0 self-center sm:max-w-[261.7px] md:self-start"
            canSave
            onSave={() =>
              isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
            }
            disabled={savingBook}
            onReserve={() => reserveBook(book.id)}
          />
          {/* <div className="flex flex-col md:overflow-y-auto md:pr-4"> */}
          <BookDetails book={book} />
          {/* </div> */}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-gray-600">Book not found</p>
        </div>
      )}
    </div>
  );
}

function BookDetails({ book }: { book: Book }) {
  const productDetails = [
    {
      label: "Language",
      value: book.language || "English",
    },
    {
      label: "Paperback",
      value: book.pages ? `${book.pages} pages` : "N/A",
    },
    {
      label: "ISBN",
      value: book.ISBN,
    },
    {
      label: "Genres",
      value: book.category.join(", ") || "N/A",
    },
    {
      label: "Reviews",
      value: BookRating,
    },
  ];
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-semibold">{book.title}</p>
        <p className="text-base font-medium text-gray-600">by {book.author}</p>
      </div>
      <div className="flex items-center gap-1 text-gray-800">
        <BookOpen size={24} />
        <p className="text-sm font-medium text-gray-600">
          {book.borrowCount} borrowed
        </p>
      </div>
      <BookRating ratingCount={135} ratingValue={4} />

      <p
        className="mt-4 whitespace-pre text-wrap text-base text-gray-600"
        dangerouslySetInnerHTML={{
          __html: book.description || "No description available",
        }}
      ></p>

      <div className="mt-6 flex flex-col gap-4">
        <p className="text-lg font-semibold">Product details</p>
        <div className="flex flex-col gap-2">
          {productDetails.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-2">
              <p className="text-gray-600">{label}:</p>
              <div className="font-medium capitalize text-gray-800">
                {typeof value === "string"
                  ? value
                  : value({
                      ratingCount: 135,
                      ratingValue: 4,
                    })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
