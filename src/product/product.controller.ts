/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/getUser.decorator';
import { CreateProductDto, FilterDto, PaginationDto, ReviewDto, UpdateProductDto } from './dto';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid'
import { existsSync, mkdirSync } from 'fs';
import { ProductExistsInterceptor } from 'src/common/interceptors/product/product.interceptor';
import { HttpExceptionFilter } from 'src/filters/http-exception/http-exception.filter';
import { FileDto } from './dto';

@UseFilters(HttpExceptionFilter)
@Controller('products')
export class ProductController {

    constructor(private product:ProductService){}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post()
    async createProduct(@Body() product:CreateProductDto){
        return await this.product.createProduct(product)
    }

    @Get() 
    @ApiBody({type:FilterDto})
    @ApiQuery({ name: 'order', required: false, type: Number })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    async getProducts(
        @Query() page:PaginationDto,
        @Query() filters:FilterDto,
        @Query('sortBy') sortBy?:'asc'|'desc',
        @Query('order') order?:'asc'|'desc',
    ){
        
        return await this.product.getAllProducts(page,filters,sortBy,order);
    }

    @Get(':id')
    getProduct(@Param('id', ParseIntPipe) productId:number){
        return this.product.productDetail(productId);
    }


    //@UseGuards(AuthGuard('jwt'))
    //@ApiBearerAuth()
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
    @ApiBody({type:FileDto})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(ProductExistsInterceptor,FileInterceptor('file', {
        storage: diskStorage({
                destination: (req, file, cb) => {  
                    const productId = req.params.id;
                    const urlPath = join(process.cwd(),'uploads','products',productId)
                    if(!existsSync(urlPath)){
                        mkdirSync(urlPath, { recursive: true });
                    }

                  cb(null, urlPath);
                },
                filename: (req, file, cb) => {
                  const ext = extname(file.originalname);
                  const filename = `${Date.now()}${uuidv4()}${ext}`;
                  cb(null, filename);
                },
              }),
              fileFilter: (req, file, cb) => {
                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
                  cb(null, true);
                } else {
                  cb(new Error('Only images are allowed...'), false);
                }
              },
    }))
    uploadProductImage(@UploadedFile(
        new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
            ],
          }),
    ) file:FileDto,@Param('id',ParseIntPipe) id: number){
        return this.product.uploadImage(file,id);
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete(':id/images/:imageId')
    deleteProductImage(
        @Param('id', ParseIntPipe) productId:number,
        @Param('imageId', ParseIntPipe) imageId: number
    ){
        const path = join(process.cwd(), 'uploads', 'product', String(productId));
        console.log(path)
        return this.product.deleteProductImage(path, productId, imageId);
    }


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

    @Get(':id/reviews')
    @ApiQuery({ name: 'rating', required: false, type: Number })
    @ApiQuery({ name: 'sortBy', required: false, type: String })
    @ApiBody({type:PaginationDto})
    async getProductReviews(
        @Param('id',ParseIntPipe) id:number,
        @Query() page:PaginationDto,
        @Query('rating',new ParseIntPipe({ optional: true })) rating?: number,
        @Query('sortBy') sortBy?:string,
    ){
        return await this.product.getProductReviews(id,rating,page,sortBy);
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
