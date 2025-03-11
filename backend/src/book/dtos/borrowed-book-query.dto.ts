import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsIn,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BorrowedBooksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bookId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : value,
  )
  isOverdue?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : value,
  )
  isReturned?: boolean;

  @IsOptional()
  @IsDateString()
  borrowStartDate?: string;

  @IsOptional()
  @IsDateString()
  borrowEndDate?: string;

  @IsOptional()
  @IsDateString()
  dueStartDate?: string;

  @IsOptional()
  @IsDateString()
  dueEndDate?: string;

  @IsOptional()
  @IsDateString()
  returnStartDate?: string;

  @IsOptional()
  @IsDateString()
  returnEndDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  category?: string | string[];

  @IsOptional()
  @IsString()
  ISBN?: string;

  @IsOptional()
  @IsIn(['available', 'unavailable'])
  availabilityStatus?: 'available' | 'unavailable';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
        ? false
        : value,
  )
  popularBooks?: boolean;

  @IsInt()
  @Min(1000) // Ensure the year is a valid 4-digit number
  @Max(new Date().getFullYear()) // Ensure the year is not in the future
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : +value)) // Convert to number
  publishedYear?: number;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  @ValidateIf((o) => o.publishedYearEnd !== undefined) // Only validate if publishedYearEnd is provided
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : +value)) // Convert to number
  publishedYearStart?: number;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  @ValidateIf((o) => o.publishedYearStart !== undefined) // Only validate if publishedYearStart is provided
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : +value)) // Convert to number
  publishedYearEnd?: number;
}
