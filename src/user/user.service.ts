/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
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

}
