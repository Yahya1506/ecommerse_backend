/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fsPromises from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImageService {
    constructor(private prisma: PrismaService){}


    async uploadImage(id: number, fileName: string){
        const image = await this.prisma.image.create({
            data:{
                path:fileName,
                product_id:id
            }
        });
        if(image){
            return image
        }
    }

    async deleteImage(path:string, imageId:number){
        const image = await this.prisma.image.findUnique({
            where:{id: imageId},
        })
        if(!image){
            throw new NotFoundException("this image does not exist");
        }
        
        const filePath = join(path,image.path);
        try {
        await fsPromises.unlink(filePath);
            console.log(`File deleted successfully: ${filePath}`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.warn(`File not found: ${filePath}`);
            } else {
                console.error(`Error deleting file ${filePath}: ${error.message}`);
                throw new HttpException('Failed to delete file',HttpStatus.INTERNAL_SERVER_ERROR); 
            }
        }

        const deleted = await this.prisma.image.delete({
            where:{id: imageId},
        })

        if(deleted){
            return {deleted, message: "image successfully deleted"};
        }
    }
}
