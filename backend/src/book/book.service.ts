// src/books/books.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookResponseDto, CreateBooksDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookQueryDto } from './dtos/book-query.dto';
import { Book, Prisma } from '@prisma/client';
import { BorrowedBooksQueryDto } from './dtos/borrowed-book-query.dto';
import { buildBookFilters } from 'src/utils/book-query';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async createBook(dto: CreateBooksDto): Promise<BookResponseDto[]> {
    const booksData = dto.books.map((book) => ({
      ...book,
      copiesAvailable: book.copiesAvailable ?? 1, // Default to 1 if not provided
    }));

    await this.prisma.book.createMany({
      data: booksData,
      skipDuplicates: true,
    });

    const books = await this.prisma.book.findMany({
      where: { ISBN: { in: booksData.map((book) => book.ISBN) } },
    });

    return books;
  }

  async updateBook(id: bigint, dto: UpdateBookDto): Promise<BookResponseDto> {
    const existingBook = await this.prisma.book.findUnique({ where: { id } });
    if (!existingBook) throw new NotFoundException('Book not found');

    return this.prisma.book.update({ where: { id }, data: dto });
  }

  async deleteBook(id: bigint): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');

    return await this.prisma.book.delete({ where: { id } });
  }

  async getAllBooks(query: BookQueryDto): Promise<BookResponseDto[]> {
    const bookFilters = buildBookFilters(query);

    return this.prisma.book.findMany({
      where: {
        AND: [
          { copiesAvailable: { gt: 0 } }, // Default filter for books with copies available
          ...bookFilters,
        ],
      },
    });
  }

  async getBookById(id: bigint): Promise<BookResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: { id, copiesAvailable: { gt: 0 } }, // findFirst instead of findUnique
    });
    if (!book) throw new NotFoundException('Book not found or unavailable');
    return book;
  }

  async updateBookCopies(
    bookId: bigint,
    change: number,
  ): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    return this.prisma.book.update({
      where: { id: bookId },
      data: { copiesAvailable: { increment: change } },
    });
  }

  // Borrow a book
  async borrowBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ borrowedBook: any; message: string }> {
    return this.prisma.$transaction(async (tx) => {
      // Fetch user and check if they are restricted from borrowing
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new ForbiddenException(
          `You are restricted from borrowing until ${user.restrictedUntil}`,
        );
      }

      // Fetch book and check availability
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) throw new NotFoundException('Book not found');
      if (book.copiesAvailable <= 0)
        throw new BadRequestException('No copies available');

      // Check if user already has this book
      const alreadyBorrowed = await tx.borrowedBook.findFirst({
        where: { userId, bookId, returnDate: null },
      });

      if (alreadyBorrowed) {
        throw new BadRequestException('You already have this book checked out');
      }

      const hasOverdue = await tx.borrowedBook.findFirst({
        where: { userId, returnDate: null, dueDate: { lt: new Date() } },
      });

      if (hasOverdue) {
        throw new ForbiddenException(
          'You have overdue books. Borrowing restricted for 1 month.',
        );
      }

      // Check borrow limit (5 books per week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const borrowCount = await tx.borrowedBook.count({
        where: {
          userId,
          borrowDate: { gte: oneWeekAgo },
        },
      });

      if (borrowCount >= 5) {
        throw new ForbiddenException(
          'Borrow limit reached (5 books per week).',
        );
      }

      // Calculate due date (14-day return policy)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Borrow book and select the book data and dueDate
      const borrowedBook = await tx.borrowedBook.create({
        data: {
          userId,
          bookId,
          dueDate,
        },
        include: {
          book: {
            select: {
              author: true,
              category: true,
              title: true,
              copiesAvailable: true,
              imageUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { copiesAvailable: { decrement: 1 } },
      });

      return {
        borrowedBook,
        message: `Book "${book.title}" borrowed successfully. Due date: ${dueDate.toLocaleDateString()}`,
      };
    });
  }

  async returnBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ returnedBook: any; message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const borrowedBook = await tx.borrowedBook.findFirst({
        where: { userId, bookId, returnDate: null },
        include: {
          book: { select: { title: true, author: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!borrowedBook) {
        throw new NotFoundException('You have not borrowed this book');
      }

      const isOverdue = new Date() > borrowedBook.dueDate;
      const now = new Date();

      // Mark book as returned
      const returnedBook = await tx.borrowedBook.update({
        where: { id: borrowedBook.id },
        data: { returnDate: now },
        include: {
          book: {
            select: {
              author: true,
              category: true,
              title: true,
              copiesAvailable: true,
              imageUrl: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { copiesAvailable: { increment: 1 } },
      });

      const message = `Book "${borrowedBook.book.title}" returned successfully.`;

      if (isOverdue) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - borrowedBook.dueDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const restrictionDays =
          daysOverdue <= 7 ? 7 : daysOverdue <= 30 ? 30 : 90;
        const restrictedUntil = new Date();
        restrictedUntil.setDate(restrictedUntil.getDate() + restrictionDays);

        await tx.user.update({
          where: { id: userId },
          data: { restrictedUntil },
        });

        // Process any pending reservations for this book
        // await this.processBookReservations(bookId);

        return { returnedBook, message };
      }

      // Ensure a response is always returned
      return { returnedBook, message };
    });
  }

  async getBorrowedBooks(params: BorrowedBooksQueryDto): Promise<any[]> {
    const {
      userId,
      bookId,
      isOverdue,
      isReturned,
      borrowStartDate,
      borrowEndDate,
      dueStartDate,
      dueEndDate,
      returnStartDate,
      returnEndDate,
      ...bookParams
    } = params;

    const borrowedFilters: Prisma.BorrowedBookWhereInput[] = [];

    if (userId) borrowedFilters.push({ userId });
    if (bookId) borrowedFilters.push({ bookId });

    if (isOverdue) {
      borrowedFilters.push({
        dueDate: { lt: new Date() },
        returnDate: null,
      });
    }

    if (isReturned !== undefined) {
      borrowedFilters.push({
        returnDate: isReturned ? { not: null } : null,
      });
    }

    // Filter by borrowDate range
    if (borrowStartDate || borrowEndDate) {
      const borrowFilter: Prisma.DateTimeFilter = {};
      if (borrowStartDate) borrowFilter.gte = new Date(borrowStartDate);
      if (borrowEndDate) borrowFilter.lte = new Date(borrowEndDate);
      borrowedFilters.push({ borrowDate: borrowFilter });
    }

    // Filter by dueDate range
    if (dueStartDate || dueEndDate) {
      const dueFilter: Prisma.DateTimeFilter = {};
      if (dueStartDate) dueFilter.gte = new Date(dueStartDate);
      if (dueEndDate) dueFilter.lte = new Date(dueEndDate);
      borrowedFilters.push({ dueDate: dueFilter });
    }

    // Filter by returnDate range
    if (returnStartDate || returnEndDate) {
      const returnFilter: Prisma.DateTimeFilter = {};
      if (returnStartDate) returnFilter.gte = new Date(returnStartDate);
      if (returnEndDate) returnFilter.lte = new Date(returnEndDate);
      borrowedFilters.push({ returnDate: returnFilter });
    }

    const bookFilters = buildBookFilters(bookParams);

    const where: Prisma.BorrowedBookWhereInput = {};

    if (borrowedFilters.length > 0) {
      where.AND = borrowedFilters;
    }

    if (bookFilters.length > 0) {
      where.book = { AND: bookFilters };
    }

    return await this.prisma.borrowedBook.findMany({
      where,
      select: {
        id: true,
        uuid: true,
        userId: true,
        bookId: true,
        borrowDate: true,
        dueDate: true,
        returnDate: true,
        book: {
          select: {
            title: true,
            author: true,
            category: true,
            ISBN: true,
            publishedYear: true,
            copiesAvailable: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async saveBook(userId: bigint, bookId: bigint) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    try {
      return await this.prisma.savedBook.create({
        data: {
          userId,
          bookId,
        },
        include: { book: true },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint violation code
      ) {
        throw new ConflictException('You have already saved this book.');
      }
      throw error; // Re-throw other errors
    }
  }

  async getSavedBooks(query: BookQueryDto, userId: bigint) {
    const bookFilters = buildBookFilters(query);

    const where: Prisma.SavedBookWhereInput = {
      userId,
    };

    if (bookFilters.length > 0) {
      where.book = { AND: bookFilters };
    }

    return this.prisma.savedBook.findMany({
      where,
      include: { book: true },
    });
  }

  async getSavedBook(userId: number, bookId: number) {
    const savedBook = await this.prisma.savedBook.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
      include: { book: true },
    });

    if (!savedBook) throw new NotFoundException('Saved book not found');

    return savedBook;
  }

  // Revert books not picked up within 7 days (Scheduled Task)
  // async revertUnpickedBooks(): Promise<{ revertedBooks: any[] }> {
  //   const sevenDaysAgo = new Date();
  //   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //   const unpickedBooks = await this.prisma.borrowedBook.findMany({
  //     where: { borrowDate: { lt: sevenDaysAgo }, returnDate: null },
  //   });

  //   const revertedBooks = [];

  //   for (const book of unpickedBooks) {
  //     await this.prisma.$transaction([
  //       this.prisma.book.update({
  //         where: { id: book.bookId },
  //         data: { copiesAvailable: { increment: 1 } },
  //       }),
  //       this.prisma.borrowedBook.delete({ where: { id: book.id } }),
  //     ]);

  //     revertedBooks.push(book);
  //   }

  //   return { revertedBooks };
  // }

  // // Check for overdue books and notify users (Scheduled Task)
  // async checkOverdueBooks(): Promise<void> {
  //   const today = new Date();

  //   const overdueBooks = await this.prisma.borrowedBook.findMany({
  //     where: {
  //       returnDate: null,
  //       dueDate: { lt: today },
  //     },
  //     include: {
  //       user: true,
  //       book: true,
  //     },
  //   });

  //   for (const record of overdueBooks) {
  //     const daysOverdue = Math.floor(
  //       (today.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24),
  //     );

  //     // Implement notification logic here
  //     // This is a placeholder for whatever notification system you want to use
  //     await this.notificationService.sendOverdueNotification(
  //       record.user.email,
  //       record.book.title,
  //       daysOverdue,
  //     );
  //   }
  // }
}
