/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/getUser.decorator';
import { CreateProductDto, PaginationDto, ReviewDto, UpdateProductDto } from './dto';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('products')
export class ProductController {

    constructor(private product:ProductService){}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post()
    async createProduct(@Body() product:CreateProductDto){
        return await this.product.createProduct(product)
    }

    @ApiBody({type:PaginationDto})
    @Get()
    async getProducts(
        @Query() page:PaginationDto,
        @Query('search') search?: string, 
        @Query('catagory') catagory?:string, 
        @Query('min',new ParseIntPipe({optional:true})) min?:number, 
        @Query('max',new ParseIntPipe({optional:true})) max?:number,
        @Query('inStock',new ParseBoolPipe({optional:true})) instock?:boolean
    ){
        
        return await this.product.getAllProducts(page,search,catagory,min,max,instock);
    }

    @Get(':id')
    getProduct(){}


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put(':id')
    async updateProduct(@Param('id',ParseIntPipe) id:number, @Body() product:UpdateProductDto){
        return await this.product.updateProduct(id,product);
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete(':id')
    async deleteProduct(@Param('id',ParseIntPipe) id:number){
        return await this.product.deleteProduct(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post(':id/images')
    uploadProductImage(){}


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete(':id/images/:imageId')
    deleteProductImage(){}


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post(':id/reviews')
    async createProductReview(
        @User() user:{id:number,email:string,jti:string},
        @Param('id',ParseIntPipe) id: number,
        @Body() review: ReviewDto
    ){
        return await this.product.creatProductReview(user.id, id,review);
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get(':id/reviews')
    async getProductReviews(
        @Param('id',ParseIntPipe) id:number,
        @Query(ParseIntPipe) page:PaginationDto,
        @Query('rating',ParseIntPipe) rating?: number
    ){
        return await this.product.getProductReviews(id,rating,page);
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete(':id/reviews/:reviewId')
    async deleteProductReview(
        @User() user:{id:number,email:string,jti:string},
        @Param('id',ParseIntPipe) id: number,
        @Param('reviewId',ParseIntPipe) rid: number
    ){
        return await this.product.deleteProductReview(user.id, id,rid);
    }
}
