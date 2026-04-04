import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * Creates the domain user profile after Supabase Auth signup.
   * Not protected by AuthGuard — the service verifies the token directly.
   * Idempotent: calling this twice returns the same profile.
   */
  @Post('register')
  register(
    @Headers('authorization') authHeader: string,
    @Body() dto: RegisterDto,
  ) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    return this.authService.register(token, dto);
  }

  /**
   * GET /auth/me
   *
   * Returns the authenticated user's domain profile.
   */
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }
}
