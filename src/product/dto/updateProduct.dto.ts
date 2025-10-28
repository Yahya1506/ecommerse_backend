/* eslint-disable prettier/prettier */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Updated name of the product' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated description of the product' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated price of the product' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: 'Updated price of the product' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stock?: number;
}
