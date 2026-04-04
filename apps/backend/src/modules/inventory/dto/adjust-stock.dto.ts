import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumberString()
  @IsNotEmpty()
  quantityDelta!: string; // positive or negative; string for decimal precision

  @IsString()
  @IsOptional()
  note?: string;
}
