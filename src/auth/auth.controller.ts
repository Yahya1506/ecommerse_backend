/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/getUser.decorator';
import { HttpExceptionFilter } from 'src/filters/http-exception/http-exception.filter';


@UseFilters(HttpExceptionFilter)
@Controller('auth')
export class AuthController {
    constructor(private auth:AuthService){}

    @Post('login')
    @ApiBody({ type: LoginDto })
    async login(@Body() user: LoginDto){
        return await this.auth.login(user);
    }

    @Post('signup')
    @ApiBody({ type: CreateUserDto })
    async signup(@Body() user: CreateUserDto){
        return await this.auth.signup(user);
    }

    @UseGuards(AuthGuard('refreshJwt'))
    @ApiBearerAuth()
    @Post('logout')
    async logout(@User() user:{id: number, email: string , jti: string}){
        return await this.auth.revokeSession(user.jti);
    }

    @UseGuards(AuthGuard('refreshJwt'))
    @ApiBearerAuth()
    @Post('refresh')
    refreshtoken(@User() user:{id: number, email: string , jti: string}){
        return this.auth.newAccessToken(user);
        
    }


    @UseGuards(AuthGuard('google'))
    @Get('google')
    googleAuth(){

    }

    @UseGuards(AuthGuard('google'))
    @Get('google/callback')
    googleAuthCallback(@User() user:{provider:string, googleId:string, email:string,fname:string, lname:string}){
       return this.auth.googleLogin(user);
    }

    
}
