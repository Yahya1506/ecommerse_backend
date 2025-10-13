/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateUserDto{

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
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


export class LoginDto{
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password:string
}