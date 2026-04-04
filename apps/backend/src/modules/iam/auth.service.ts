import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { users } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } },
    );
  }

  /**
   * Create the domain user profile after Supabase Auth signup.
   *
   * The Bearer token in the request is verified by AuthGuard before this
   * runs — but this endpoint is *not* protected by AuthGuard (since the
   * user profile doesn't exist yet). We verify the token manually here.
   */
  async register(
    token: string,
    dto: RegisterDto,
  ): Promise<typeof users.$inferSelect> {
    // Verify the Supabase token to get the auth user
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const supabaseAuthId = data.user.id;
    const email = data.user.email ?? '';

    // Idempotent — return existing profile if already created
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseAuthId, supabaseAuthId))
      .limit(1);

    if (existing) return existing;

    const [created] = await this.db
      .insert(users)
      .values({
        id: dto.id ?? ulid(),
        supabaseAuthId,
        email,
        fullName: dto.fullName,
        plan: 'free',
      })
      .returning();

    return created;
  }

  /**
   * Get the current user's domain profile.
   */
  async getMe(userId: string): Promise<typeof users.$inferSelect> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
