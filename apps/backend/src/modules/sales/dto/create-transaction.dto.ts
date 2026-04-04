import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class LineItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  /** Snapshot of the product name at time of sale (denormalized for history). */
  @IsString()
  @IsNotEmpty()
  productName!: string;

  /** Snapshot of the unit price at time of sale (denormalized). */
  @IsNumberString()
  unitPrice!: string;

  @IsNumberString()
  quantity!: string;
}

export class CreateTransactionDto {
  /** Optional client-generated ULID for offline-first sync. */
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsIn(['cash', 'gcash', 'maya', 'card', 'credit', 'other'])
  paymentMethod!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  /** Optional tax override; if omitted, store's taxRate is used. */
  @IsNumberString()
  @IsOptional()
  taxRate?: string;
}
