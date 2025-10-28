/* eslint-disable prettier/prettier */
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'The current page number (starts from 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of records to display per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
