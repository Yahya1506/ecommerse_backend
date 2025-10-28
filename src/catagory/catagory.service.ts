/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-catch */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './dto';
import { handlePrismaError } from 'src/utils/prismaErrors';

@Injectable()
export class CatagoryService {
    constructor(private prismaService: PrismaService){}

    async getCatagories(){
        return this.prismaService.catagory.findMany();
    }
        
    async createCatagory(payload: CategoryDto) {
    try {
      const cat = await this.prismaService.catagory.create({
        data: {
          cat_name: payload.cat_name,
        },
      });

      return { message: 'Category created successfully', data: cat };
    } catch (error) {
        handlePrismaError(error)
    }
  }

    async updateCatagory(catagory:CategoryDto, cid:number){
        try {
            const updated_cat = await this.prismaService.catagory.update({
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
         await this.prismaService.catagory.delete({
            where:{
                id : cid
            }
        })
        return {message:"catagory deleted successfully"};
        
      } catch (error) {
        return handlePrismaError(error);
      }
        
    }
    async findCatagory(id:number){
      return this.prismaService.catagory.findUnique({ where:{ id } });
    }
      
}
