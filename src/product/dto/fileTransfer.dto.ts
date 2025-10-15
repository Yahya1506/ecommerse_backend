/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class FileDto {
  @ApiProperty({
    description: 'Image Datas',
    type:'string',
    format: 'binary',
  })
  file: Express.Multer.File
}