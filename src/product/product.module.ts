import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FeedbackModule } from 'src/feedback/feedback.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [FeedbackModule],
})
export class ProductModule {}
