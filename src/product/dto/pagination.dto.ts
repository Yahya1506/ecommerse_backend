/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsPositive, Min } from "@nestjs/class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class PaginationDto{

    @ApiProperty()
    @IsNotEmpty()
    @Type(()=>Number)
    @IsPositive()
    take: number = 4;

    @ApiProperty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Number)
    @Min(0)
    cursor?: number;
}