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
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const uploadDir = join(process.cwd(), 'uploads');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          cb(null, true);
        } else {
          cb(new Error('Only images are allowed...'), false);
        }
      },
    }),
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
