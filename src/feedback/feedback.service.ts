/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto, ReviewDto } from 'src/product/dto';
import { handlePrismaError } from 'src/utils/prismaErrors';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService){}

    async createReview(userId: number, productId:number, payload:ReviewDto){
        try{
            const existingFeedback = await this.prisma.feedback.findFirst({
                where:{
                    user_id: userId,
                    product_id : productId
                }
            })

            if(existingFeedback){
                const updatedReview = await this.prisma.feedback.update({
                        where: { id: existingFeedback.id },
                        data: {
                        rating: payload.rating,
                        review: payload.review,
                    },
                });
                return {message:"review updated successfully", data:updatedReview}
            
            } else {
                const createdReview = await this.prisma.feedback.create({
                    data: {
                    rating: payload.rating,
                    review: payload.review,
                    product_id: productId,
                    user_id: userId,
                    },
                });
                return {message: "review created successfully", data:createdReview};
            }
        }catch(error){
            if(error instanceof HttpException) throw error;
            handlePrismaError(error);
        }   
    }

    async deleteReview(userId: number,productId: number, reviewId: number){
        try{
            const existingReview = await this.prisma.feedback.findUnique({
                where:{
                    id:reviewId,
                    product_id:productId,
                }
            });
            if(!existingReview){
                throw new NotFoundException("this review does not exist");
            }
            if(existingReview.user_id !== userId){
                throw new UnauthorizedException("you are not authorized to delete someone else's review");
            }

            const deletedReview = await this.prisma.feedback.delete({ where:{ id : reviewId } });

            return {message: " review deleted successfully", data:deletedReview}

        }catch(error){
            if(error instanceof HttpException) throw error;
            handlePrismaError(error);
        }
            

    }

    async getReviews(
    rating: number | undefined,
    pagination: PaginationDto,
    sortBy?: string,
    ) {
        try {
            const { page = 1, limit = 5 } = pagination;

            const whereClause: any = {};
            if (rating !== undefined) {
                whereClause.rating = rating;
            }

            const skip = (page - 1) * limit;

            const totalRecords = await this.prisma.feedback.count({
                where: whereClause,
            });

            const totalPages = Math.ceil(totalRecords / limit);

            const reviews = await this.prisma.feedback.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy:
                    sortBy && sortBy === 'rating'
                    ? { rating: 'desc' }
                    : { createdAt: 'desc' },
                select: {
                    id: true,
                    rating: true,
                    review: true,
                    createdAt: true,
                    user_id: true,
                    product_id: true,
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
                data: reviews,
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }


}
