import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  pages?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  copiesAvailable?: number;
}
