/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min, Max } from "@nestjs/class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumberString } from "class-validator"



export class CreateProductDto{

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
  
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price:number

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description:string

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    cat_id:number
    
}

export class UpdateProductDto{
 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name:string


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description:string

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price:number
}

export class ReviewDto{

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @Min(1)
    @Max(5)
    rating:number

    @ApiProperty()
    @IsOptional()
    @IsString()
    review?:string
}

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

export class FilterDto{

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search:string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    catagory:string

    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Number)
    min:number

    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Number)
    max:number

    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Boolean)
    instock:boolean
}