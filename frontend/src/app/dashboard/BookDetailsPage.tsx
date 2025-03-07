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
import { BookOpen, Star } from "lucide-react";

const RATING_COUNT = 135;
const RATING_VALUE = 4;

const dummySimilarBooks = [
  {
    id: "1",
    ISBN: "978-0-18-879270-6",
    title: "Crime and Punishment",
    author: "Kazuo Ishiguro",
    category: "Children's Literature",
    copiesAvailable: 6,
    publishedYear: 1950,
    imageUrl: null,
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
  },
  {
    id: "2",
    ISBN: "978-0-300-52170-2",
    title: "The Hobbit",
    author: "Henrik Ibsen",
    category: "Adventure",
    copiesAvailable: 2,
    publishedYear: 1950,
    imageUrl: null,
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
  },
  {
    id: "3",
    ISBN: "978-0-406-43160-8",
    title: "Lord of the Flies",
    author: "Edgar Rice Burroughs",
    category: "Horror",
    copiesAvailable: 4,
    publishedYear: 1950,
    imageUrl: null,
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [],
  },
  {
    id: "4",
    ISBN: "978-0-87325-516-5",
    title: "The Brothers Karamazov",
    author: "George Grossmith",
    category: "Biography",
    copiesAvailable: 7,
    publishedYear: 1993,
    imageUrl: null,
    borrowCount: 0,
    createdAt: "2025-03-03T17:26:52.648Z",
    savedBooks: [],
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
    queryClient.refetchQueries({
      queryKey: ["getBooks"],
      exact: false,
    });
    toast.success("Book saved successfully");
  });

  const { mutate: deleteSavedBook, isPending: isDeletingSavedBook } =
    useDeleteSavedBook(() => {
      queryClient.invalidateQueries({ queryKey: ["getBookDetails", id] });

      queryClient.refetchQueries({
        queryKey: ["getBooks"],
        exact: false,
      });
      toast.success("Book removed from saved successfully");
    });

  const updatingSavedBooks = isSavingBook || isDeletingSavedBook;

  const isSaved = book?.savedBooks?.some(
    (savedBook) => savedBook.userId === user?.id,
  );

  return (
    <div className="flex flex-col gap-16 pb-16">
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {isLoading ? (
          <>
            <BookCardSkeleton className="max-w-[261.7px]" canSave />
            <Skeleton className="w-full flex-1" />
          </>
        ) : book ? (
          <>
            <BookCard
              book={{ ...book, isSaved: isSaved ?? false }}
              className="flex-shrink-0 self-center sm:max-w-[261.7px] md:self-start"
              canSave
              onSave={() =>
                isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
              }
              disabled={updatingSavedBooks}
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
          {dummySimilarBooks.slice(0, 4).map((book) => {
            const isSaved = true;

            return (
              <BookCard
                key={book.id}
                book={{ ...book, isSaved: isSaved ?? false }}
                onReserve={() => {}}
                onSave={() =>
                  isSaved ? deleteSavedBook(book.id) : saveBook(book.id)
                }
                disabled={updatingSavedBooks}
                onCardClick={
                  updatingSavedBooks
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

const desc =
  "Introduction to Computer Science introduces students to the fundamentals of computer science by connecting the dots between applications they use every day and the underlying technologies that power them. Throughout, students learn valuable technical skills including how to write simple JavaScript programs, format a webpage with HTML and CSS code, reduce the size of a file, and more.\n\nOpening chapters of the text provide students with historical background, describe the numbering systems that computers operate with, and explain how computers store and convert data such as images and music. Later chapters explore the anatomy of computer hardware such as CPUs and memory, how computers communicate over networks, and the programming languages that allow us to solve problems using computation. The book concludes with chapters dedicated to security and privacy, the structure and function of operating systems, and the world of e-commerce.\n\nAccessible in approach, Introduction to Computer Science is designed to help non-computer science majors learn how technology and computers power the world around them. The text is well suited for introductory courses in computer science.\nPerry Donham is a lecturer of computer science in the College of Arts & Sciences at Boston University. Mr. Donham previously served as a technical consultant and analyst in the financial services and healthcare fields, helping clients, including HP and IBM, solve performance issues, build new systems, and solve tricky computational problems. In 1995, he launched one of the world's first 10,000 websites, which is still running.";

function BookDetails({ book }: { book: Book }) {
  const productDetails = [
    {
      label: "Publisher",
      value: "Cognella Academic Publishing(August 9, 2018)",
    },
    {
      label: "Language",
      value: "English",
    },
    {
      label: "Paperback",
      value: "100 pages",
    },
    {
      label: "ISBN",
      value: "978-1-305-07287-3",
    },
    {
      label: "Item Weight",
      value: "1.14 pounds",
    },
    {
      label: "Dimensions",
      value: "8 x 0.54 x 10 inches",
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
      <BookRating />

      <p
        className="whitespace-pre text-wrap text-base text-gray-600"
        dangerouslySetInnerHTML={{ __html: desc }}
      ></p>

      <div className="mt-8 flex flex-col gap-4">
        <p className="text-lg font-semibold">Product details</p>
        <div className="flex flex-col gap-2">
          {productDetails.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-2">
              <p className="text-gray-600">{label}:</p>
              <p className="font-medium text-gray-800">
                {typeof value === "string" ? value : value()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookRating() {
  return (
    <div className="flex items-center gap-3 text-gray-800">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600">
          <span className="text-base font-semibold">
            {RATING_VALUE.toFixed(1)}
          </span>
          /5
        </p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, star) =>
            star + 1 <= Math.floor(RATING_VALUE) ? (
              <Star
                key={star}
                size={16}
                className="fill-yellow-400 text-yellow-400"
              />
            ) : (
              <Star key={star} size={16} className="text-yellow-400" />
            ),
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600">{RATING_COUNT} ratings</p>
    </div>
  );
}
