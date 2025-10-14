/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsString } from "@nestjs/class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { MinLength } from "class-validator"

export class LoginDto{
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
}