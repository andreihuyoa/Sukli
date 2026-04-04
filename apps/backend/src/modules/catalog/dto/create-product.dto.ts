import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  unit?: string; // 'piece' | 'kg' | 'bottle' | 'pack'

  @IsNumberString()
  @IsNotEmpty()
  price!: string; // string to preserve decimal precision; service validates > 0

  @IsNumberString()
  @IsOptional()
  costPrice?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  barcode?: string;
}
