/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
