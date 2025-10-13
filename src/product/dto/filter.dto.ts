/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from "@nestjs/class-validator"
import {  ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"


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