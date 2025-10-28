/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-catch */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CatagoryDto } from './dto';
import { handlePrismaError } from 'src/utils/prismaErrors';

@Injectable()
export class CatagoryService {
    constructor(private prisma: PrismaService){}

    async getCatagories(){
        return this.prisma.catagory.findMany();
    }
        
    async createCatagory(payload: CatagoryDto) {
    try {
      const cat = await this.prisma.catagory.create({
        data: {
          cat_name: payload.cat_name,
        },
      });

      return { message: 'Category created successfully', data: cat };
    } catch (error) {
        handlePrismaError(error)
    }
  }

    async updateCatagory(catagory:CatagoryDto, cid:number){
        try {
            const updated_cat = await this.prisma.catagory.update({
              where:{
                  id:cid
              },
              data:{
                  cat_name:catagory.cat_name
              }
          });

          return {message: "catagory updated successfully",data:updated_cat};
        } catch (error) {
          return handlePrismaError(error)
        }
        
    }
    async deleteCatagory(cid:number){
      try {
         await this.prisma.catagory.delete({
            where:{
                id : cid
            }
        })
        return {message:"catagory deleted successfully"};
        
      } catch (error) {
        return handlePrismaError(error);
      }
        
    }
      
}
