/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorator/getUser.decorator';
import {
  CreateProductDto,
  FilterDto,
  PaginationDto,
  ReviewDto,
  UpdateProductDto,
  FileDto,
} from './dto';
import { ProductService } from './product.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { ProductExistsInterceptor } from 'src/common/interceptors/product/product.interceptor';
import { HttpExceptionFilter } from 'src/filters/http-exception/http-exception.filter';

@ApiTags('Products')
@UseFilters(HttpExceptionFilter)
@Controller('products')
export class ProductController {
  constructor(private product: ProductService) {}

  // ------------------------- CREATE PRODUCT -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() product: CreateProductDto) {
    return await this.product.createProduct(product);
  }

  // ------------------------- GET ALL PRODUCTS -------------------------
  @Get()
  @ApiOperation({ summary: 'Get all products with filters, sorting & pagination' })
  @ApiQuery({ name: 'order', required: false, description: 'Sorting order (asc or desc)', example: 'asc' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'price' })
  @ApiResponse({ status: 200, description: 'List of products fetched successfully' })
  async getProducts(
    @Query() page: PaginationDto,
    @Query() filters: FilterDto,
    @Query('sortBy') sortBy?: 'asc' | 'desc',
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return await this.product.getAllProducts(page, filters, sortBy, order);
  }

  // ------------------------- GET PRODUCT BY ID -------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific product' })
  @ApiResponse({ status: 200, description: 'Product details fetched successfully' })
  getProduct(@Param('id', ParseIntPipe) productId: number) {
    return this.product.productDetail(productId);
  }

  // ------------------------- UPDATE PRODUCT -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() product: UpdateProductDto) {
    return await this.product.updateProduct(id, product);
  }

  // ------------------------- DELETE PRODUCT -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by its ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.product.deleteProduct(id);
  }

  // ------------------------- UPLOAD PRODUCT IMAGE -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/images')
  @ApiOperation({ summary: 'Upload an image for a specific product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileDto })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(
    ProductExistsInterceptor,
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const productId = req.params.id;
          const urlPath = join(process.cwd(), 'uploads', 'products', productId);
          if (!existsSync(urlPath)) {
            mkdirSync(urlPath, { recursive: true });
          }
          cb(null, urlPath);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}-${uuidv4()}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })], // 5MB
      }),
    )
    file: FileDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.product.uploadImage(file, id);
  }

  // ------------------------- DELETE PRODUCT IMAGE -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete a specific image of a product' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  deleteProductImage(@Param('id', ParseIntPipe) productId: number, @Param('imageId', ParseIntPipe) imageId: number) {
    const path = join(process.cwd(), 'uploads', 'product', String(productId));
    return this.product.deleteProductImage(path, productId, imageId);
  }

  // ------------------------- CREATE PRODUCT REVIEW -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Create or update a review for a product' })
  @ApiResponse({ status: 201, description: 'Review created or updated successfully' })
  async createProductReview(
    @User() user: { id: number; email: string; jti: string },
    @Param('id', ParseIntPipe) id: number,
    @Body() review: ReviewDto,
  ) {
    return await this.product.creatProductReview(user.id, id, review);
  }

  // ------------------------- GET PRODUCT REVIEWS -------------------------
  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get all reviews for a specific product' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by specific rating (1-5)', example: 5 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort reviews by field', example: 'date' })
  @ApiResponse({ status: 200, description: 'List of product reviews fetched successfully' })
  async getProductReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query() page: PaginationDto,
    @Query('rating', new ParseIntPipe({ optional: true })) rating?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return await this.product.getProductReviews(id, rating, page, sortBy);
  }

  // ------------------------- DELETE PRODUCT REVIEW -------------------------
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Delete a specific product review by its ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteProductReview(
    @User() user: { id: number; email: string; jti: string },
    @Param('id', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return await this.product.deleteProductReview(user.id, productId, reviewId);
  }
}
