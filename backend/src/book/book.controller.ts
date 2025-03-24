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
  Request,
} from '@nestjs/common';
import { BookQueryDto } from './dtos/book-query.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';
import { BookResponseDto, CreateBooksDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookService } from './book.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Book } from '@prisma/client';
import { BorrowedBooksQueryDto } from './dtos/borrowed-book-query.dto';

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
  async getAllBooks(
    @Query() query: BookQueryDto,
  ): Promise<{ data: BookResponseDto[]; pagination: any }> {
    return this.booksService.getAllBooks(query);
  }

  @Get('borrowed')
  async getBorrowedBooks(
    @Request() req,
    @Query() query: BorrowedBooksQueryDto,
  ) {
    return await this.booksService.getBorrowedBooks({
      ...query,
      userId: req.user.userId,
    });
  }

  @Get('saved')
  async getSavedBooks(@Request() req, @Query() query: BookQueryDto) {
    return this.booksService.getSavedBooks(query, req.user.userId);
  }

  @Get('saved/:bookId')
  async getSavedBook(@Param('bookId') id: number, @Request() req) {
    return this.booksService.getSavedBook(req.user.userId, id);
  }

  @Delete('saved/:bookId')
  async deleteSavedBook(@Param('bookId') bookId: bigint, @Request() req) {
    return this.booksService.deleteSavedBook(req.user.userId, bookId);
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

  @Patch(':id/copies')
  @UseGuards(IsAdminGuard)
  async updateBookCopies(
    @Param('id') id: bigint,
    @Body('change') change: number,
  ): Promise<BookResponseDto> {
    return this.booksService.updateBookCopies(id, change);
  }

  @Post(':id/save')
  async saveBook(@Param('id') id: bigint, @Request() req) {
    return this.booksService.saveBook(req.user.userId, id);
  }

  @Get(':id')
  async getBookById(@Param('id') id: bigint): Promise<BookResponseDto> {
    return await this.booksService.getBookById(id);
  }
}
