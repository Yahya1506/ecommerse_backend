/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Login user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully, access & refresh tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  /* ---------- SIGNUP ---------- */
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or user already exists' })
  async signup(@Body() payload: CreateUserDto) {
    return this.authService.signup(payload);
  }

  /* ---------- LOGOUT (Revoke Refresh Session) ---------- */
  @UseGuards(SessionGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user and revoke their active refresh session' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid session' })
  async logout(@User() user: { jti: string }) {
    return this.authService.revokeRefreshSession(user.jti);
  }

  /* ---------- REFRESH TOKEN ---------- */
  @UseGuards(AuthGuard('refreshJwt'))
  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({ summary: 'Generate a new access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'New access token generated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@User() user: { id: number; email: string; jti: string }) {
    return this.authService.generateNewAccessToken(user);
  }

  /* ---------- GOOGLE LOGIN FLOW ---------- */
  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page' })
  googleAuth() {
    // Handled by passport-google strategy
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @ApiResponse({ status: 200, description: 'User authenticated via Google successfully' })
  @ApiResponse({ status: 400, description: 'Google authentication failed' })
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
