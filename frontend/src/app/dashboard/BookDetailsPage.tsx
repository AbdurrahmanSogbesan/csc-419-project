import { useNavigate, useParams } from "react-router";
import {
  useDeleteSavedBook,
  useGetBookDetails,
  useSaveBook,
} from "@/hooks/books";
import BookCard from "./components/BookCard";
import { useAuthStore } from "@/lib/stores/auth";
import BookCardSkeleton from "./components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import BookRating from "@/components/BookRating";
import { checkIfBookIsReserved } from "@/lib/utils";

const dummySimilarBooks = [
  {
    id: "1",
    ISBN: "978-0-18-879270-6",
    title: "Crime and Punishment",
    author: "Kazuo Ishiguro",
    category: "Children's Literature",
    copiesAvailable: 6,
    publishedYear: 1950,
    imageUrl: "https://placehold.co/100x100",
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [
      {
        id: "12",
        uuid: "501a58c5-bba9-4715-931a-4b90c104b9e4",
        userId: "3",
        bookId: "1",
        createdAt: "2025-03-07T00:03:23.689Z",
      },
    ],
    copiesBorrowed: 0,
    pages: 12,
    language: "English",
    description:
      "The Brothers Karamazov is a novel by the Russian author Fyodor Dostoevsky. It is the last of his great novels, and the first to feature the philosophical and ethical concerns that would become central to his work.",
  },
  {
    id: "2",
    ISBN: "978-0-300-52170-2",
    title: "The Hobbit",
    author: "Henrik Ibsen",
    category: "Adventure",
    copiesAvailable: 2,
    publishedYear: 1950,
    imageUrl: "https://placehold.co/100x100",
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [
      {
        id: "15",
        uuid: "e88e5523-abc9-46cd-acb8-4f92177e1cf9",
        userId: "3",
        bookId: "2",
        createdAt: "2025-03-07T00:53:51.048Z",
      },
    ],
    copiesBorrowed: 0,
    pages: 12,
    language: "English",
    description:
      "The Brothers Karamazov is a novel by the Russian author Fyodor Dostoevsky. It is the last of his great novels, and the first to feature the philosophical and ethical concerns that would become central to his work.",
  },
  {
    id: "3",
    ISBN: "978-0-406-43160-8",
    title: "Lord of the Flies",
    author: "Edgar Rice Burroughs",
    category: "Horror",
    copiesAvailable: 4,
    publishedYear: 1950,
    imageUrl: "https://placehold.co/100x100",
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [],
    copiesBorrowed: 0,
    pages: 12,
    language: "English",
    description:
      "The Brothers Karamazov is a novel by the Russian author Fyodor Dostoevsky. It is the last of his great novels, and the first to feature the philosophical and ethical concerns that would become central to his work.",
  },
  {
    id: "4",
    ISBN: "978-0-87325-516-5",
    title: "The Brothers Karamazov",
    author: "George Grossmith",
    category: "Biography",
    copiesAvailable: 7,
    publishedYear: 1993,
    imageUrl: "https://placehold.co/100x100",
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [],
    copiesBorrowed: 0,
    pages: 12,
    language: "English",
    description:
      "The Brothers Karamazov is a novel by the Russian author Fyodor Dostoevsky. It is the last of his great novels, and the first to feature the philosophical and ethical concerns that would become central to his work.",
  },
];

export default function BookDetailsPage() {
  const { id } = useParams();
  const { data: book, isLoading } = useGetBookDetails(id);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: saveBook, isPending: isSavingBook } = useSaveBook(() => {
    queryClient.invalidateQueries({ queryKey: ["getBookDetails", id] });
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      queryClient.invalidateQueries({ queryKey: ["getBookDetails", id] });
      toast.success("Book removed from saved successfully");
    });

  const updatingBooks = isSavingBook || isDeletingSavedBook;

  const isSaved = book?.savedBooks?.some(
    (savedBook) => savedBook.userId === user?.id,
  );

  const isReserved = checkIfBookIsReserved(
    book?.reservations ?? [],
    user?.id as string,
  );

  return (
    <div className="flex flex-col gap-16 pb-16">
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
              disabled={updatingBooks}
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

      <div className="flex flex-col gap-6">
        <p className="text-3xl font-semibold">Similar books</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* todo: fetch books with category filter and store here */}
          {dummySimilarBooks.slice(0, 4).map((book) => {
            const isSaved = true;

            return (
              <BookCard
                key={book.id}
                book={{ ...book, isSaved }}
                onReserve={() => {}}
                onSave={() =>
                  isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
                }
                disabled={updatingBooks}
                onCardClick={
                  updatingBooks
                    ? undefined
                    : () => {
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                        navigate(`/dashboard/books/${book.id}`);
                      }
                }
              />
            );
          })}
        </div>
      </div>
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
              <div className="font-medium text-gray-800">
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
