/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({
    description: 'Image file to upload (supports common formats like JPEG, PNG, WEBP)',
    type: 'string',
    format: 'binary',
    example: 'product_image.jpg',
  })
  file: Express.Multer.File;
}
