/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Samsung Galaxy A15',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Price of the product in local currency (e.g., PKR, USD)',
    example: 50000,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Detailed description of the product',
    example:
      'The Samsung Galaxy A15 features a 6.5-inch Super AMOLED display, 128GB storage, and a 5000mAh battery.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Unique category ID that this product belongs to',
    example: 3,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  cat_id: number;
}
