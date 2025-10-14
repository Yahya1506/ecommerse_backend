/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { MinLength } from "class-validator"

export class CreateUserDto{

    @ApiProperty({example:'abc@mail.com'})
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string


    @ApiProperty({example:'password@1234'})
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password:string

    @ApiPropertyOptional({example:'John'})
    @IsString()
    @IsOptional()
    fname?:string

    @ApiPropertyOptional({example:'Doe'})
    @IsString()
    @IsOptional()
    lname?:string
}
