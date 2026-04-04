import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsOptional()
  id?: string; // client-generated ULID for offline-first sync

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  currency?: string; // defaults to 'PHP'

  @IsNumberString()
  @IsOptional()
  taxRate?: string; // e.g. '0.1200'
}
