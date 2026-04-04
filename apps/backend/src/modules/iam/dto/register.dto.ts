import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * After the client signs up via Supabase Auth SDK, it must call
 * POST /auth/register to create the domain user profile.
 * The JWT in the Authorization header identifies the Supabase auth user.
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  id?: string; // optional: client can provide its own ULID for offline-first sync
}
