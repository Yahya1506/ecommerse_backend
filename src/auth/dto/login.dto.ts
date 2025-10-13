/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsString } from "@nestjs/class-validator"
import { ApiProperty } from "@nestjs/swagger"

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