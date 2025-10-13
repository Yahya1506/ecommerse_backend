/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min, Max } from "@nestjs/class-validator"
import { ApiProperty } from "@nestjs/swagger"

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