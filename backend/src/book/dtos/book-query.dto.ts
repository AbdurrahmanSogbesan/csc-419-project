import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class BookQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  ISBN?: string;

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
