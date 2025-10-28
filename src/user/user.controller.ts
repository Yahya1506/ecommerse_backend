/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from 'src/decorator/getUser.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get logged-in user profile',
    description:
      'Fetches detailed information about the currently authenticated user using the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    schema: {
      example: {
        id: 1,
        email: 'johndoe@example.com',
        fname: 'John',
        lname: 'Doe',
        createdAt: '2025-10-28T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  async getProfile(@User() user: any) {
    return this.userService.getUserProfile(user.id);
  }
}
