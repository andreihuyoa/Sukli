import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
  /** Our domain ULID — from users table */
  id: string;
  /** Supabase auth.users UUID */
  supabaseAuthId: string;
  email: string;
  plan: 'free' | 'premium';
}

/**
 * Extracts the authenticated user from the request, as populated by AuthGuard.
 *
 * Usage: @CurrentUser() user: AuthUser
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);
