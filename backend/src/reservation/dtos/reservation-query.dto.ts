import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReservationStatus } from '@prisma/client';

export class ReservationQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  bookId?: number;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notified?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reservationId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  // Book related filters
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsOptional()
  category?: string | string[];

  @IsString()
  @IsOptional()
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

  @IsOptional()
  @IsEnum(['all', 'user'])
  scope?: 'all' | 'user';
}
