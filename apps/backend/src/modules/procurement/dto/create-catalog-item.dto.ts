import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsString()
  @IsOptional()
  unitDescription?: string;

  @IsNumberString()
  price!: string;

  @IsOptional()
  @IsPositive()
  minOrderQuantity?: number;
}
