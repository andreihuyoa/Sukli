import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import { DRIZZLE, DrizzleDb } from "../../database/database.module";
import { users } from "../../database/schema";
import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * AuthGuard — verifies Supabase JWTs and attaches the domain user to req.user.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header
 *  2. Verify token via Supabase admin client (auth.getUser)
 *  3. Look up our domain users table by supabase_auth_id
 *  4. Attach the domain user to request for downstream use
 *
 * If the user exists in Supabase auth but not yet in our users table,
 * we return 401 — the client must call POST /auth/register first to
 * create the domain profile.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb
  ) {
    this.supabase = createClient(
      config.getOrThrow("SUPABASE_URL"),
      config.getOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing authorization token");
    }

    // Verify the JWT with Supabase — this also refreshes the token if near-expiry
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const supabaseAuthId = data.user.id;

    // Look up domain user profile
    const [domainUser] = await this.db
      .select({
        id: users.id,
        supabaseAuthId: users.supabaseAuthId,
        email: users.email,
        plan: users.plan,
      })
      .from(users)
      .where(eq(users.supabaseAuthId, supabaseAuthId))
      .limit(1);

    if (!domainUser) {
      throw new UnauthorizedException(
        "User profile not found. Call POST /auth/register to create your profile."
      );
    }

    request.user = domainUser as AuthUser;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
  }
}
