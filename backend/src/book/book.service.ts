// src/books/books.service.ts
import {
  ConflictException,
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
      copiesAvailable: book.copiesAvailable ?? 1,
      copiesBorrowed: book.copiesBorrowed ?? 0,
      category: Array.isArray(book.category)
        ? book.category.map((cat) => cat.toLowerCase())
        : book.category
          ? [(book.category as string).toLowerCase()]
          : [],
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

    return this.prisma.book.update({
      where: { id },
      data: {
        ...dto,
        category: dto.category
          ? {
              set: Array.isArray(dto.category)
                ? dto.category.map((cat) => cat.toLowerCase())
                : [(dto.category as string).toLowerCase()],
            }
          : undefined,
      },
    });
  }

  async deleteBook(id: bigint): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');

    return await this.prisma.book.delete({ where: { id } });
  }

  async getAllBooks(query: BookQueryDto): Promise<BookResponseDto[]> {
    const { where, orderBy } = buildBookFilters(query);

    // Properly merge the default filter with the dynamic where conditions
    const combinedWhere: Prisma.BookWhereInput = {
      AND: [
        { copiesAvailable: { gt: 0 } }, // Default filter for books with copies available
        ...(Object.keys(where).length > 0 ? [where] : []),
      ],
    };

    return this.prisma.book.findMany({
      where: combinedWhere,
      orderBy,
      include: { savedBooks: true, reservations: true },
    });
  }

  async getBookById(id: bigint): Promise<BookResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: { id, copiesAvailable: { gt: 0 } },
      include: { savedBooks: true, reservations: true },
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
      borrowedFilters.push({
        borrowDate: {
          ...(borrowStartDate && { gte: new Date(borrowStartDate) }),
          ...(borrowEndDate && { lte: new Date(borrowEndDate) }),
        },
      });
    }

    // Filter by dueDate range
    if (dueStartDate || dueEndDate) {
      borrowedFilters.push({
        dueDate: {
          ...(dueStartDate && { gte: new Date(dueStartDate) }),
          ...(dueEndDate && { lte: new Date(dueEndDate) }),
        },
      });
    }

    // Filter by returnDate range
    if (returnStartDate || returnEndDate) {
      borrowedFilters.push({
        returnDate: {
          ...(returnStartDate && { gte: new Date(returnStartDate) }),
          ...(returnEndDate && { lte: new Date(returnEndDate) }),
        },
      });
    }

    const { where: bookFilters } = buildBookFilters(bookParams);

    const where: Prisma.BorrowedBookWhereInput = {
      ...(borrowedFilters.length > 0 && { AND: borrowedFilters }),
      ...(Object.keys(bookFilters).length > 0 && { book: { is: bookFilters } }),
      returnDate: null,
    };

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
            borrowCount: true,
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
    const { where: bookFilters, orderBy } = buildBookFilters(query);

    const where: Prisma.SavedBookWhereInput = {
      userId,
      ...(Object.keys(bookFilters).length > 0 && { book: { is: bookFilters } }),
    };

    return this.prisma.savedBook.findMany({
      where,
      include: {
        book: {
          include: { reservations: true },
        },
      },
      orderBy: orderBy ? { book: orderBy } : undefined,
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

  async deleteSavedBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ deletedBook: any; message: string }> {
    const savedBook = await this.prisma.savedBook.findFirst({
      where: { userId, bookId },
      include: { book: true },
    });

    if (!savedBook) {
      throw new NotFoundException('Saved book not found');
    }

    await this.prisma.savedBook.delete({ where: { id: savedBook.id } });

    return {
      deletedBook: savedBook.book,
      message: 'Saved book deleted successfully',
    };
  }
}
