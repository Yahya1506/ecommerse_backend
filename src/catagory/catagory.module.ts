import { Module } from '@nestjs/common';
import { CatagoryController } from './catagory.controller';
import { CatagoryService } from './catagory.service';

@Module({
  controllers: [CatagoryController],
  providers: [CatagoryService]
})
export class CatagoryModule {}
