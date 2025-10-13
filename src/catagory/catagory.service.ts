/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CatagoryDto } from './dto';

@Injectable()
export class CatagoryService {
    constructor(private prisma: PrismaService){}

    async getCatagories(){
        const catagories = await this.prisma.catagory.findMany();
        return catagories
    }
    async createCatagory(catagory:CatagoryDto){
        const exists = await this.prisma.catagory.findUnique({
            where:{
                cat_name:catagory.cat_name
            }
        })
        if(exists){
            throw new ConflictException("catagory already exists")
        }
        const cat = await this.prisma.catagory.create({
            data:{
                cat_name:catagory.cat_name
            }
        })

        return cat
    }

    async updateCatagory(catagory:CatagoryDto, cid:number){
        const cat = await this.prisma.catagory.findUnique({
            where:{
                id:cid
            }
        })

        if(!cat){
            throw new NotFoundException("this catagory does not exists");
        }

        const updated_cat = await this.prisma.catagory.update({
            where:{
                id:cid
            },
            data:{
                cat_name:catagory.cat_name
            }
        });

        return updated_cat;
    }
    async deleteCatagory(cid:number){
        const cat = await this.prisma.catagory.findUnique({
            where:{
                id:cid
            }
        })

        if(!cat){
            throw new NotFoundException("this catagory does not exists");
        }

        return await this.prisma.catagory.delete({
            where:{
                id : cid
            }
        })
    }

}
