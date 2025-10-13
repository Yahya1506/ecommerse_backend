import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FeedbackModule } from 'src/feedback/feedback.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [FeedbackModule, ImageModule],
})
export class ProductModule {}
