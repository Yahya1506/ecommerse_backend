/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CatagoryModule } from './catagory/catagory.module';
import { ImageModule } from './image/image.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskSchedularModule } from './task-schedular/task-schedular.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { SpreadsheetModule } from './spreadsheet/spreadsheet.module';
import { WebhookModule } from './webhook/webhook.module';


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','uploads/products'),
    }),
    MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory:  (config: ConfigService) => ({
          transport: {
            host: 'smtp.gmail.com',
            port: 465,              // or 587 for STARTTLS
            secure: true,          // true for port 465
            auth: {
              user: config.get('Email'),     // your Gmail address
              pass: config.get('Email_Password'),     // your app password (you said it's in env var `Email`)
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('EMAIL')}>`,
          },
        }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TaskSchedularModule,
    MulterModule,
    AuthModule,
    UserModule,
    ProductModule, 
    CatagoryModule, 
    ImageModule, 
    FeedbackModule, 
    PrismaModule,
    JwtModule,
    SpreadsheetModule,
    WebhookModule
  ]
  
})
export class AppModule {}
