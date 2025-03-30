import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category?: string[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  copiesAvailable?: number;

  @IsInt()
  @Type(() => Number)
  @Min(1000)
  @IsOptional()
  publishedYear?: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  pages?: number;
}
