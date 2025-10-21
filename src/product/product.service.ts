/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, FilterDto, PaginationDto, ReviewDto, UpdateProductDto } from './dto';
import { FeedbackService } from 'src/feedback/feedback.service';
import { ImageService } from 'src/image/image.service';
import { join } from 'path';
import { Response } from 'express';
import { FileDto } from './dto';
import { SpreadsheetService } from 'src/spreadsheet/spreadsheet.service';

@Injectable()
export class ProductService {

    constructor(
        private prisma:PrismaService, 
        private review:FeedbackService, 
        private image:ImageService,
        private spreadsheet: SpreadsheetService
    ){}

    async createProduct( product: CreateProductDto){
        
        const catExists = await this.prisma.catagory.findUnique({
            where:{
                id:product.cat_id
            }
        });

        if(!catExists){
            throw new NotFoundException("this catagory does not exists");
        }
        
        const createdProduct = await this.prisma.product.create({
            data:{
                name:product.name,
                price: product.price,
                description: product.description,
                catagory:{
                    connect:{
                        id: product.cat_id
                    }
                }
                
            },
            include:{
                catagory:true
            }
        });

        if (createdProduct){
            this.spreadsheet.addRow([
                createdProduct.id,
                createdProduct.name,
                createdProduct.description,
                createdProduct.price,
                createdProduct.catagory.cat_name
            ]);
            throw new HttpException(`${createdProduct.name} has been created`,HttpStatus.CREATED)
        }
    }

    async getAllProducts( page:PaginationDto, filters:FilterDto, sortBy?:string, order?: 'asc'| 'desc') {
        const products = await this.prisma.product.findMany({
            take:page.take,
            skip: page.cursor?1:0,
            cursor:page.cursor?{
                id:page.cursor
            }:undefined,
            where: {
                ...(filters.search && {
                    name: {
                        startsWith: filters.search,
                        mode: 'insensitive' 
                    }
                }),

                ...(filters.catagory && {
                    catagory: {        
                          cat_name:filters.catagory  
                    }
                }),

            
                ...((filters.min || filters.max) && {
                    price: {
                        ...(filters.min && { gte: filters.min }),
                        ...(filters.max && { lte: filters.max })
                    }
                }),
                ...(filters.instock !== undefined && {
                    stock: filters.instock ? { gt: 0 } : 0
                })
            },
            select:{
                id:true,
                name:true,
                price:true,
                description:true,
                catagory:{
                    select:{
                        cat_name:true
                    }
                }

            },
            orderBy:(sortBy && (sortBy==='price' || sortBy==='rating'))?{
                [sortBy]:order?order:'desc'
            }:{
                createdAt:'desc'
            }
        });
        
        const newCursor = (products.length == page.take)? products[page.take - 1].id : null;
        return {
            newCursor,
            data:products,
            nextPage: (products.length === page.take)
        }

    }


    async updateProduct(id:number,product:UpdateProductDto){
        const productExists = await this.prisma.product.findUnique({
            where:{
                id:id
            }
        });
        if(!productExists){
            throw new NotFoundException("product not found");
        }

        const updateProduct = await this.prisma.product.update({
            where:{
                id:id
            },
            data:{
                name:product.name,
                description: product.description,
                price:product.price
            },
            include:{
                catagory:true
            }
        })
        await this.spreadsheet.updateRow(updateProduct.id,[
            updateProduct.id,
            updateProduct.name,
            updateProduct.description,
           updateProduct.price,
            updateProduct.catagory.cat_name
        ])
        return updateProduct
    }

    async deleteProduct(id:number){
        const productExists = await this.prisma.product.findUnique({
            where:{
                id:id
            }
        });
        if (!productExists){
            throw new NotFoundException("product does not exist");
        }

        const deleted = await this.prisma.product.delete({
            where:{
                id:id
            }
        });

        if (deleted){
            throw new HttpException("deleted successfuly",HttpStatus.OK);
        }

    }

    async getProductReviews(pid: number, rating: number|undefined, page:PaginationDto, orderBy?: string){
        const productExists = await this.prisma.product.findUnique({
            where:{
                id:pid
            }
        });
        if (!productExists){
            throw new NotFoundException("product does not exist");
        }
        return this.review.getReviews(rating, page,orderBy);
    }

    async uploadImage(file:FileDto, id:number){
        const productExists = await this.prisma.product.findUnique({
            where:{id:id}
        });
        
        if(!productExists){
            throw new NotFoundException("product does not exist");
        }

        return this.image.uploadImage(id,file.file.filename);
    }

    async deleteProductImage(path:string, productId:number, imageId:number){
        const productExists = await this.prisma.product.findUnique({
            where:{id:productId}
        });
        
        if(!productExists){
            throw new NotFoundException("product does not exist");
        }
        return this.image.deleteImage(path,imageId);
    }

    async productDetail(productId: number){
        const productExists = await this.prisma.product.findUnique({
            where:{id:productId},
            select:{
                id:true,
                name:true,
                description:true,
                stock:true,
                price:true,
                catagory:{
                    select:{ cat_name:true}
                },
                Feedback:{
                    select:{
                        user_id:true,
                        rating:true,
                        review:true
                    }
                }
            }
        });
        
        if(!productExists){
            throw new NotFoundException("product does not exist");
        }

        const images = await this.prisma.image.findMany({
                where:{product_id:productId},
                select:{path:true}
        });

        const allImages: string[] = [];
        images.forEach(image => {
            allImages.push(join(String(productId),image.path));
        });
        console.log(allImages);

        const aggregations = await this.prisma.feedback.groupBy({
            by:["product_id"],
            where:{product_id:productId},
            _avg:{
                rating: true
            },
            _count:{
                rating:true
            },
        });
        const averageRating = aggregations[0]._avg.rating;
        const reviewCount = aggregations[0]._count.rating;
        
        return {productDetail:productExists, averageRating, reviewCount, images:allImages};
    }

    async creatProductReview(uid: number, pid:number, review: ReviewDto){
        const productExists = await this.prisma.product.findUnique({
            where:{
                id:pid
            }
        });
        if (!productExists){
            throw new NotFoundException("product does not exist");
        }

        return await this.review.createReview(uid,pid,review);

    }

    async deleteProductReview(uid: number, pid: number, rid: number){
        const productExists = await this.prisma.product.findUnique({
            where:{
                id:pid
            }
        });
        if(!productExists){
            throw new NotFoundException("product does not exist");
        }
        return this.review.deleteReview(uid, pid, rid);
    }

}
