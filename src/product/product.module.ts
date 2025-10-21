import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FeedbackModule } from 'src/feedback/feedback.module';
import { ImageModule } from 'src/image/image.module';
import { SpreadsheetModule } from 'src/spreadsheet/spreadsheet.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [FeedbackModule, ImageModule, SpreadsheetModule],
})
export class ProductModule {}
