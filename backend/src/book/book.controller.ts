// src/books/books.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { BookQueryDto } from './dtos/book-query.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';
import { BookResponseDto, CreateBooksDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookService } from './book.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Book } from '@prisma/client';

@Controller('books')
export class BookController {
  constructor(private readonly booksService: BookService) {}

  @Post()
  @UseGuards(IsAdminGuard)
  async createBook(@Body() dto: CreateBooksDto): Promise<BookResponseDto[]> {
    return await this.booksService.createBook(dto);
  }

  @Public()
  @Get()
  async getAllBooks(@Query() query: BookQueryDto): Promise<BookResponseDto[]> {
    return this.booksService.getAllBooks(query);
  }

  @Patch(':id')
  @UseGuards(IsAdminGuard)
  async updateBook(
    @Param('id') id: bigint,
    @Body() dto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    return this.booksService.updateBook(id, dto);
  }

  @Delete(':id')
  @UseGuards(IsAdminGuard)
  async deleteBook(@Param('id') id: bigint): Promise<Book> {
    return await this.booksService.deleteBook(id);
  }

  @Public()
  @Get(':id')
  async getBookById(@Param('id') id: bigint): Promise<BookResponseDto> {
    const book = await this.booksService.getBookById(id);
    if (!book) throw new NotFoundException('Book not found or unavailable');
    return book;
  }

  @Patch(':id/copies')
  @UseGuards(IsAdminGuard)
  async updateBookCopies(
    @Param('id') id: bigint,
    @Body('change') change: number,
  ): Promise<BookResponseDto> {
    return this.booksService.updateBookCopies(id, change);
  }
}
