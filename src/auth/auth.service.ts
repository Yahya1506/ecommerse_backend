/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

 
 
 
 

import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RefreshToken } from 'generated/prisma';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private config: ConfigService, private jwt: JwtService){}


    async login(user: LoginDto){
        const userExists = await this.prisma.user.findFirst({
            where:{
                email: user.email
            }
        });
        if (!userExists || userExists.googleId){
            throw new NotFoundException("email does not exist")
        }
        if(userExists.password){
            const password = await this.comparePassword(user.password, userExists.password);
            if(!password){
            throw new UnauthorizedException("incorrect password");
        }
        }
        
        const session = await this.createRefreshToken(userExists.id);
        const access_token = await this.signToken(userExists.id,userExists.email,session.id);
        const refresh_token = await this.signRefreshToken(userExists.id,userExists.email,session.id);
        
        return {access_token,refresh_token};

    }
    async googleLogin(user:{provider:string, googleId:string, email:string,fname:string, lname:string}){
        const userExists = await this.prisma.user.findFirst({
            where:{
                googleId:user.googleId
            }
        });
        if(!userExists){
            const createdUser = await this.prisma.user.create({
                data:{
                    email : user.email,
                    googleId:user.googleId,
                    fname: user.fname,
                    lname : user.lname,
                }
            });
            const session = await this.createRefreshToken(createdUser.id);
            const access_token = await this.signToken(createdUser.id,createdUser.email,session.id);
            const refresh_token = await this.signRefreshToken(createdUser.id,createdUser.email,session.id);

            return {access_token,refresh_token}
        }
        const session = await this.createRefreshToken(userExists.id);
        const access_token = await this.signToken(userExists.id,userExists.email,session.id);
        const refresh_token = await this.signRefreshToken(userExists.id,userExists.email,session.id);
        return {access_token,refresh_token}
    }
    async signup(user: CreateUserDto){
        const hash = await this.hashPassword(user.password);
        const exists = await this.prisma.user.findFirst({
            where:{
                email: user.email
            }
        });
        if (exists){
            throw new ConflictException("email already exists");
        }
        const createdUser = await this.prisma.user.create({
            data:{
                email : user.email,
                password : hash,
                fname: user.fname,
                lname : user.lname,
            }
        });

        return createdUser;
    }

    async newAccessToken(user: {id: number, email: string , jti: string}){
       const payload = user;
       const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET')
        });
        
        return {new_access_token: token};
    }

    async hashPassword(password: string): Promise<string> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        return hash;
      }

      async comparePassword(password: string, hash: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
      }

      async signToken(userId: number, email: string, jti: string) {
        const payload = {
            id: userId,
            email,
            jti,
        };

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET')
        });

        return token;
    }
    async signRefreshToken(userId: number, email: string, jti:string) {
        const payload = {
            id: userId,
            email,
            jti,
        };

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: this.config.get('REFRESH_JWT_SECRET')
        });

        return token;
        
    }
    async createRefreshToken(userId: number):Promise<RefreshToken>{
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 7*24);
        const session = await this.prisma.refreshToken.create({
            data: {
                userId,
                expiresAt,
            }
        });
        return session;
    }

    async revokeSession(jti:string){
        const token = await this.prisma.refreshToken.findUnique({
            where:{id:jti}
        })

        if(!token){
            throw new NotFoundException("token not in db");
        }
        const invalidated = await this.prisma.refreshToken.update({
             where:{
                id: jti
            },
            data:{
                invalidatedAt : new Date()
            }
        });
        
        return invalidated;
    }
}
