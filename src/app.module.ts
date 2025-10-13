/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CatagoryModule } from './catagory/catagory.module';
import { ImageModule } from './image/image.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule,
    AuthModule,
    UserModule,
    ProductModule, 
    CatagoryModule, 
    ImageModule, 
    FeedbackModule, 
    PrismaModule,
    JwtModule
  ]
  
})
export class AppModule {}
