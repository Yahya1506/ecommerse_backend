/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { MinLength } from "class-validator"

export class CreateUserDto{

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password:string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    fname?:string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lname?:string
}
