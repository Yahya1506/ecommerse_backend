/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RefreshToken } from 'generated/prisma';
import { Prisma } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly userService: UserService
  ) {}

  /* ---------- LOGIN ---------- */
  async login(payload: LoginDto) {
    try {
        const user = await this.userService.findUserByEmail(payload.email);

        if (!user || user.googleId) {
        throw new NotFoundException('No account found.');
        }

        if (user.password) {
            const isPasswordValid = await this.verifyPassword(
                payload.password,
                user.password,
            );
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials. Please try again.');
            }
        }

        return await this.generateAuthTokens(user.id, user.email);
    } catch (error) {
        if (error instanceof HttpException) throw error;  
        this.handlePrismaError(error);
    }
  }

  /* ---------- GOOGLE LOGIN ---------- */
  async googleLogin(payload: {
    provider: string;
    googleId: string;
    email: string;
    fname: string;
    lname: string;
  }) {
    try {
        const existingUser = await this.prisma.user.findFirst({
            where: { googleId: payload.googleId },
        });
        let id:any = existingUser?.id;
        let email:any = existingUser?.email

        if (!existingUser) {
            const user = await this.userService.createGoogleUser(payload)
            id = user.id;
            email= user.email;
        }

        return await this.generateAuthTokens(id, email);
    } catch (error) {
        if (error instanceof HttpException) throw error;
        this.handlePrismaError(error);
    }
  }

  /* ---------- SIGNUP ---------- */
  async signup(payload: CreateUserDto) {
    try {
        const existingUser = await this.userService.findUserByEmail(payload.email);

        if (existingUser) {
            throw new ConflictException(
                'An account with this email already exists.',
            );
        }

        payload.password = await this.hashPassword(payload.password);

        if(await this.userService.createUser(payload)){
            return {message: "account created successfully"}
        }

    } catch (error) {
        if (error instanceof HttpException) throw error;
        this.handlePrismaError(error);
    }
  }

  /* ---------- GENERATE NEW ACCESS TOKEN ---------- */
  async generateNewAccessToken(payload: { id: number; email: string; jti: string }) {
    try {
      const newAccessToken = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      });
      return { new_access_token: newAccessToken };
    } catch {
      throw new InternalServerErrorException('Failed to generate access token.');
    }
  }

  /* ---------- PASSWORD HELPERS ---------- */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /* ---------- TOKEN SIGNING ---------- */
  private async signAccessToken(userId: number, email: string, jti: string) {
    return this.jwt.signAsync(
      { id: userId, email, jti },
      {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      },
    );
  }

  private async signRefreshToken(userId: number, email: string, jti: string) {
    return this.jwt.signAsync(
      { id: userId, email, jti },
      {
        expiresIn: '1d',
        secret: this.config.get('REFRESH_JWT_SECRET'),
      },
    );
  }

  /* ---------- SESSION MANAGEMENT ---------- */

private async createRefreshSession(userId: number): Promise<RefreshToken> {
  // Set expiry time to 7 days from now using dayjs
  const expiresAt = dayjs().add(7, 'day').toDate();

  return this.prisma.refreshToken.create({
    data: { userId, expiresAt },
  });
}

async revokeRefreshSession(sessionId: string) {
  try {
    const session = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Refresh token not found or already revoked.');
    }

    // Use dayjs for the invalidation timestamp as well
    return this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { invalidatedAt: dayjs().toDate() },
    });
  } catch (error) {
    this.handlePrismaError(error);
  }
}

  /* ---------- COMMON UTILITY FUNCTIONS ---------- */

  private async generateAuthTokens(userId: number, email: string) {
    const session = await this.createRefreshSession(userId);
    const accessToken = await this.signAccessToken(userId, email, session.id);
    const refreshToken = await this.signRefreshToken(userId, email, session.id);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /* ---------- PRISMA ERROR HANDLER ---------- */
  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Common Prisma error codes
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Duplicate record detected.');
        case 'P2025':
          throw new NotFoundException('Record not found in the database.');
        default:
          throw new InternalServerErrorException('Database error occurred.');
      }
    }
    throw new InternalServerErrorException('An unexpected error occurred.');
  }
}
