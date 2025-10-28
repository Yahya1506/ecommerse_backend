/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterDto {
  @ApiPropertyOptional({
    description: 'Search term to filter products by name (case-insensitive)',
    example: 'Samsung',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter products by category name',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum price for product filtering',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  min?: number;

  @ApiPropertyOptional({
    description: 'Maximum price for product filtering',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  max?: number;

  @ApiPropertyOptional({
    description: 'Filter only products that are in stock (true = in stock, false = out of stock)',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  instock?: boolean;
}
