/* eslint-disable prettier/prettier */
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('webhook')
export class WebhookController {
    constructor(private prisma:PrismaService){}

    @Post('spreadsheet-update')
    async Sync(@Body() payload:any, @Headers('x-api-key') key:string){
        console.log(payload);
        const id = payload.id
        console.log(key);
        const existing = await this.prisma.product.findUnique({
            where:{id}
        });
        if (!existing){
            const cat = await this.prisma.catagory.findFirst({
                where:{cat_name:payload.catagory},
                select:{
                    id:true
                }
            });
            console.log(cat)
            if(cat){
                const user = await this.prisma.product.create({
                    data:{
                        id:payload.id,
                        name:payload.name,
                        description:payload.description,
                        price:payload.price,
                        cat_id:cat.id,
                    }
                
                });

                 console.log(user);
            }
            
        }
    }

}
