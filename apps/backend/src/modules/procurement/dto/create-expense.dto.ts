import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

const EXPENSE_CATEGORIES = [
  'supplies',
  'utilities',
  'rent',
  'salaries',
  'marketing',
  'maintenance',
  'logistics',
  'other',
] as const;

export class CreateExpenseDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumberString()
  amount!: string;

  @IsString()
  @IsIn(EXPENSE_CATEGORIES)
  category!: string;

  /** ISO date string YYYY-MM-DD — user-controlled date of the expense. */
  @IsString()
  @IsNotEmpty()
  expenseDate!: string;

  @IsString()
  @IsOptional()
  note?: string;
}
