/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestApplication } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
   app.useGlobalPipes(new ValidationPipe(
    {
      transform:true,
      whitelist:true,
    }
   ));

  app.useStaticAssets(join(__dirname, '..', 'uploads'),{
    prefix:'/product',
  })
  const config = new DocumentBuilder()
        .setTitle('Ecommerse Backend API')
        .setDescription('a backend api for your ecommerse app')
        .setVersion('1.0') 
        .addBearerAuth()
        .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
