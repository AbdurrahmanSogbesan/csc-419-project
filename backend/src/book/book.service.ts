// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookResponseDto, CreateBooksDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookQueryDto } from './dtos/book-query.dto';
import { Book } from '@prisma/client';

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
    const {
      search,
      title,
      author,
      category,
      ISBN,
      publishedYear,
      publishedYearStart,
      publishedYearEnd,
    } = query;

    return this.prisma.book.findMany({
      where: {
        copiesAvailable: { gt: 0 }, // Exclude books with 0 copies
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { author: { contains: search, mode: 'insensitive' } },
                  { category: { contains: search, mode: 'insensitive' } },
                  { ISBN: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          title ? { title: { contains: title, mode: 'insensitive' } } : {},
          author ? { author: { contains: author, mode: 'insensitive' } } : {},
          category
            ? { category: { contains: category, mode: 'insensitive' } }
            : {},
          ISBN ? { ISBN: { contains: ISBN, mode: 'insensitive' } } : {},
          // Make sure publishedYear is a number
          publishedYear ? { publishedYear: Number(publishedYear) } : {},
          publishedYearStart && publishedYearEnd
            ? {
                publishedYear: {
                  gte: Number(publishedYearStart),
                  lte: Number(publishedYearEnd),
                },
              }
            : {},
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
}
