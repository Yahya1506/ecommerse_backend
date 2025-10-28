/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/getUser.decorator';
import { HttpExceptionFilter } from 'src/filters/http-exception/http-exception.filter';
import { SessionGuard } from './gaurd/token-validation.gaurd';

@UseFilters(HttpExceptionFilter)
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ---------- LOGIN ---------- */
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  /* ---------- SIGNUP ---------- */
  @Post('signup')
  @ApiBody({ type: CreateUserDto })
  async signup(@Body() payload: CreateUserDto) {
    console.log("signup reached")
    return this.authService.signup(payload);
  }

  /* ---------- LOGOUT (Revoke Refresh Session) ---------- */
  @UseGuards(SessionGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@User() user: { jti: string }) {
    return this.authService.revokeRefreshSession(user.jti);
  }

  /* ---------- REFRESH TOKEN ---------- */
  @UseGuards(AuthGuard('refreshJwt'))
  @ApiBearerAuth()
  @Post('refresh')
  async refreshToken(@User() user: { id: number; email: string; jti: string }) {
    return this.authService.generateNewAccessToken(user);
  }

  /* ---------- GOOGLE LOGIN FLOW ---------- */
  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleAuth() {
    // Handled by passport-google strategy
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleAuthCallback(
    @User()
    user: {
      provider: string;
      googleId: string;
      email: string;
      fname: string;
      lname: string;
    },
  ) {
    return this.authService.googleLogin(user);
  }
}
