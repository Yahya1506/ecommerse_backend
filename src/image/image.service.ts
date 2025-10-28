/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fsPromises from 'fs/promises';
import { join } from 'path';
import { handlePrismaError } from 'src/utils/prismaErrors';
import { Prisma } from '@prisma/client';

@Injectable()
export class ImageService {
    constructor(private prismaService: PrismaService){}


    async createImage(id: number, fileName: string){
        try{
            const createdImage = await this.prismaService.image.create({
                data:{
                    path:fileName,
                    product_id:id
                }
            });
            
            return {message:"image created and uploaded successfully", data:createdImage}
        } catch(error) {
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
        
    }

    async deleteImage(path:string, imageId:number){
        try {
        const image = await this.prismaService.image.findUnique({
            where:{id: imageId},
        })
        if(!image){
            throw new NotFoundException("this image does not exist");
        }
        
        const filePath = join(path,image.path);
        
        await fsPromises.unlink(filePath);
        const deletedImage = await this.prismaService.image.delete({
            where:{id: imageId},
        })

        
        return {message: "image successfully deleted", data: deletedImage};
        } catch (error) {
            if(error instanceof HttpException) throw error
            else if(error instanceof Prisma.PrismaClientKnownRequestError)
                return handlePrismaError(error)
            else if (error.code === 'ENOENT') {
                console.warn("File not found:");
            } else {
                console.error("Error deleting file");
                throw new HttpException('Failed to delete file',HttpStatus.INTERNAL_SERVER_ERROR); 
            }
        }
        
    }
}
