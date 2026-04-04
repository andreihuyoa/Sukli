import { IsNotEmpty, IsString } from 'class-validator';

export class VoidTransactionDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
