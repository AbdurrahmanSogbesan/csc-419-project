type Book = {
  id: string;
  ISBN: string;
  title: string;
  author: string;
  category: string;
  copiesAvailable: number;
  publishedYear: number;
  createdAt: string;
  imageUrl: string | null;
  borrowCount: number;
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
  popularBooks?: boolean;
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
