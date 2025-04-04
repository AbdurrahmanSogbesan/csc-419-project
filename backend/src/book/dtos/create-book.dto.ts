// src/books/dto/create-book.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateABookDto {
  @IsString()
  @IsNotEmpty()
  ISBN: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category?: string[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  copiesBorrowed?: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  copiesAvailable?: number;

  @IsInt()
  @Type(() => Number)
  @Min(1000)
  @IsOptional()
  publishedYear: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  pages?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateBooksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateABookDto)
  books: CreateABookDto[];
}

export class BookResponseDto {
  id: bigint;
  ISBN: string;
  title: string;
  author: string;
  description: string;
  pages: number;
  category: string[];
  imageUrl: string;
  copiesAvailable: number;
  copiesBorrowed: number;
  publishedYear: number;
  createdAt: Date;
  language: string;
}
