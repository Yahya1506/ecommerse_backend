/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
constructor(private prisma: PrismaService){}

    async getUserProfile(id:number){
        const user = await this.prisma.user.findUnique({
            where:{
                id:id
            },
            omit:{
                password:true
            }
        });

        if(!user){
            throw new NotFoundException("user not found")
        }
        return user;
    }
    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async createUser(payload: CreateUserDto){
        return await this.prisma.user.create({
            data: {
                email: payload.email,
                password: payload.password,
                fname: payload.fname,
                lname: payload.lname,
            },
            omit:{
                password:true,
            }
        });
    }

    async createGoogleUser(payload: {
    provider: string;
    googleId: string;
    email: string;
    fname: string;
    lname: string;
  }){
        return await this.prisma.user.create({
            data: {
                email: payload.email,
                googleId: payload.googleId,
                fname: payload.fname,
                lname: payload.lname,
            },
            omit:{
                password:true,
            }
        });
    }
}
