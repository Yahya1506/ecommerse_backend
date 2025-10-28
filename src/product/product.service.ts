/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, FilterDto, PaginationDto, ReviewDto, UpdateProductDto } from './dto';
import { FeedbackService } from 'src/feedback/feedback.service';
import { ImageService } from 'src/image/image.service';
import { join } from 'path';
import { Response } from 'express';
import { FileDto } from './dto';
import { SpreadsheetService } from 'src/spreadsheet/spreadsheet.service';
import { CatagoryService } from 'src/catagory/catagory.service';
import { handlePrismaError } from 'src/utils/prismaErrors';

@Injectable()
export class ProductService {

    constructor(
        private prismaService:PrismaService, 
        private reviewService:FeedbackService, 
        private imageService:ImageService,
        private spreadsheetService: SpreadsheetService,
        private catagoryService: CatagoryService
    ){}

    async createProduct( payload: CreateProductDto){
        try {
            const catExists = await this.catagoryService.findCatagory(payload.cat_id);

            if(!catExists){
                throw new NotFoundException("catagory not found");
            }
            
            const createdProduct = await this.prismaService.product.create({
                data:{
                    name:payload.name,
                    price: payload.price,
                    description: payload.description,
                    catagory:{
                        connect:{
                            id: payload.cat_id
                        }
                    }
                    
                },
                include:{
                    catagory:true
                }
            });

            
            await this.spreadsheetService.appendRow([
                createdProduct.id,
                createdProduct.name,
                createdProduct.description,
                createdProduct.price,
                createdProduct.catagory.cat_name
            ]);
            return {message: `${createdProduct.name} has been created`};
        
        } catch (error) {
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
        
    }

    async getAllProducts(
    pagination: PaginationDto,
    filters: FilterDto,
    sortBy?: string,
    order?: 'asc' | 'desc',
    ) {
        try {
            const { page = 1, limit = 10 } = pagination;
            const { search, category, min, max, instock } = filters;

            const whereClause: any = {};

            if (search) {
            whereClause.name = {
                contains: search, 
                mode: 'insensitive',
            };
            }

            if (category) {
            whereClause.catagory = { cat_name: category };
            }

            if (min !== undefined || max !== undefined) {
            whereClause.price = {};
            if (min !== undefined) whereClause.price.gte = min;
            if (max !== undefined) whereClause.price.lte = max;
            }

            if (instock !== undefined) {
            whereClause.stock = instock ? { gt: 0 } : 0;
            }

            const skip = (page - 1) * limit;

            const totalRecords = await this.prismaService.product.count({
            where: whereClause,
            });

            const totalPages = Math.ceil(totalRecords / limit);

            const products = await this.prismaService.product.findMany({
            skip,
            take: limit,
            where: whereClause,
            orderBy:
                sortBy && ['price', 'rating'].includes(sortBy)
                ? { [sortBy]: order ?? 'desc' }
                : { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                catagory: { select: { cat_name: true } },
            },
            });

            return {
                meta: {
                    currentPage: page,
                    totalPages,
                    totalRecords,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
                data: products,
            };
        } catch (error) {
            return handlePrismaError(error);
        }
    }
    async productDetail(productId: number){
        try{
            const existingProduct = await this.prismaService.product.findUnique({
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
                            user:{
                                select:{
                                    id:true,
                                    fname:true,
                                    lname:true,
                                }
                            },
                            rating:true,
                            review:true
                        }
                    }
                }
            });
            
            if(!existingProduct){
                throw new NotFoundException("product does not exist");
            }

            const images = await this.prismaService.image.findMany({
                    where:{product_id:productId},
                    select:{path:true}
            });

            const allImages: string[] = [];
            images.forEach(image => {
                allImages.push(join(String(productId),image.path));
            });

            const aggregations = await this.prismaService.feedback.groupBy({
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
            
            return {productDetail:existingProduct, averageRating, reviewCount, images:allImages};
        }  catch (error) {
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }  
    }

    async updateProduct(id:number,payload:UpdateProductDto){
        try {
            if (!payload || Object.keys(payload).length === 0) {
                throw new BadRequestException('No fields provided for update.');
            }
            const existingProduct = await this.findProductById(id)
            if(!existingProduct){
                throw new NotFoundException(`product with ${id} does not exists`);
            }
            const updateData: any = {};
  
            if (payload.name !== undefined) updateData.name = payload.name;
            if (payload.description !== undefined) updateData.description = payload.description;
            if (payload.price !== undefined) updateData.price = payload.price;

            const updatedProduct = await this.prismaService.product.update({
                where: { id },
                data: updateData,
                include: { catagory: true },
            });
            this.spreadsheetService.updateRow(updatedProduct.id,[
                updatedProduct.id,
                updatedProduct.name,
                updatedProduct.description,
                updatedProduct.price,
                updatedProduct.catagory.cat_name
            ]).catch(err => {
                // Log spreadsheet error, but don’t break product update flow
                console.error('Spreadsheet update failed:', err.message);
            });
            return {message:"product updated successfully",updatedProduct}
        } catch (error) {
            if(error instanceof HttpException) throw error
            return handlePrismaError(error);
        }
        
    }

    async deleteProduct(id:number){
        try{
            const existingProduct = await this.findProductById(id);
            if (!existingProduct){
                throw new NotFoundException("product does not exist");
            }

            const deletedProduct = await this.prismaService.product.delete({ where:{ id } });

            return {message:"product deleted successfully",data:deletedProduct}
        }catch(error){
            if(error instanceof HttpException) throw error
            return handlePrismaError(error)
        }
    }

    async getProductReviews(productId: number, rating: number|undefined, page:PaginationDto, orderBy?: string){
        try{
            const existingProduct = await this.findProductById(productId);
            if (!existingProduct){
                throw new NotFoundException("product does not exist");
            }
            return this.reviewService.getReviews(rating, page,orderBy);
        }catch(error){
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
    }
    
    async creatProductReview(userId: number, productId:number, payload: ReviewDto){
        try{
            const existingProduct = await this.findProductById(productId);
            if (!existingProduct){
                throw new NotFoundException("product does not exist");
            }

            return await this.reviewService.createReview(userId,productId,payload);
        }catch(error){
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }

    }

    async deleteProductReview(userId: number, productId: number, reviewId: number){
        try{
            const existingProduct = await this.findProductById(productId)
            if(!existingProduct){
                throw new NotFoundException("product does not exist");
            }
            return this.reviewService.deleteReview(userId, productId, reviewId);
        }catch(error){
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
    }


    async uploadImage(file:FileDto, productId:number){
        try{
            const existingProduct = await this.findProductById(productId)
            
            if(!existingProduct){
                throw new NotFoundException("product does not exist");
            }

            return this.imageService.createImage(productId,file.file.filename);
        } catch(error) {
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
    }

    async deleteProductImage(path:string, productId:number, imageId:number){
        try{
            const existingProduct = await this.findProductById(productId)
            if(!existingProduct){
                throw new NotFoundException("product does not exist");
            }
            return this.imageService.deleteImage(path,imageId);
        } catch(error) {
            if(error instanceof HttpException) throw error;
            return handlePrismaError(error);
        }
    }



    async findProductById(id:number){
        return this.prismaService.product.findUnique({ where:{ id } });
    }
}
