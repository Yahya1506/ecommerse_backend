/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto, ReviewDto } from 'src/product/dto';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService){}

    async createReview(uid: number, pid:number, review:ReviewDto){
        const feedback = await this.prisma.feedback.findFirst({
            where:{
                user_id: uid,
                product_id : pid
            }
        })

        if(feedback){
            const updatedReview = await this.prisma.feedback.update({
                    where: { id: feedback.id },
                    data: {
                    rating: review.rating,
                    review: review.review,
                },
            });
            if(updatedReview){
            throw new HttpException("review Updated successfully",HttpStatus.CREATED);
        }
        
        } else {
            const createdReview = await this.prisma.feedback.create({
                data: {
                rating: review.rating,
                review: review.review,
                product_id: pid,
                user_id: uid,
                },
            });
            if(createdReview){
                throw new HttpException("review created successfully",HttpStatus.CREATED);
            }
        }

        
        
    }

    async deleteReview(uid: number,pid: number, rid: number){
        const reviewExists = await this.prisma.feedback.findUnique({
            where:{
                id:rid,
                product_id:pid,
            }
        });
        if(!reviewExists){
            throw new NotFoundException("this review does not exist");
        }
        if(reviewExists.user_id !== uid){
            throw new UnauthorizedException("you are not authorized to delete someone else's review");
        }

        const deleted = await this.prisma.feedback.delete({
            where:{
                id : rid
            }
        })

        if(deleted){
            return {message: " review deleted successfully"}
        }

    }

    async getReviews(rating: number|undefined, page:PaginationDto, sortBy?: string){

        const reviews = await this.prisma.feedback.findMany({
            where:rating? {
                rating:rating
            }:{},
            take:page.take,
            skip: page.cursor? 1:0,
            cursor: page.cursor? {
                id:page.cursor
            }:undefined,
            orderBy:(sortBy && sortBy==='rating')?{
                rating:'desc'
            }:{
                createdAt: 'desc'
            }
        });
        const newCursor = (reviews.length == page.take )? reviews[page.take - 1].id:null;

        return {newCursor,
            data:reviews,
            nextPage:(reviews.length === page.take)
        }
    }


}
