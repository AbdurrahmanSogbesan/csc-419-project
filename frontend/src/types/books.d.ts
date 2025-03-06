type Book = {
  ISBN: string;
  author: string;
  category: string;
  copiesAvailable: number;
  createdAt: string;
  id: string;
  imageUrl: string | null;
  publishedYear: number;
  title: string;
  savedBooks?: SavedBook[];
};

type SavedBook = {
  id: string;
  uuid: string;
  userId?: string;
  user?: User;
  bookId?: string;
  book?: Book;
  createdAt: string;
};

type GetBooksQueryParams = {
  search?: string;
  title?: string;
  author?: string;
  category?: string;
  ISBN?: string;
  publishedYear?: number;
  publishedYearStart?: number;
  publishedYearEnd?: number;
  availabilityStatus?: "available" | "unavailable";
};

type BorrowedBook = {
  id: string;
  uuid: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  userId?: string;
  user?: User;
  bookId?: string;
  book?: Book;
};
